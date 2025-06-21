const Course = require('../models/courseModel');
const { getRedisClient } = require('../config/redis');
const { sendMessage, getTeacherByName } = require('../kafka/producer');

exports.createCourse = async (req, res) => {
  try {
    const { title, description, teacherName } = req.body;

    // Get teacher details via Kafka
    const teacherData = await getTeacherByName(teacherName);
    // Remove Kafka message sending for teacher lookup
    if (!teacherData || !teacherData._id) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Create course with teacher ID
    const course = await Course.create({
      title,
      description,
      teacher_id: teacherData._id
    });
    
    // Clear the courses cache
    const redisClient = getRedisClient();
    await redisClient.del('all_courses');
    await redisClient.del(`teacher_courses:${teacherData._id}`);

    // Notify about new course via Kafka
    await sendMessage('course_updates', {
      type: 'course_created',
      course: {
        id: course._id,
        title: course.title,
        teacherName: teacherData.name,
        teacherId: teacherData._id
      }
    });

    res.status(201).json({
      message: 'Course created successfully',
      course: {
        ...course.toObject(),
        teacherName: teacherData.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating course', error: error.message });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const redisClient = getRedisClient();
    
    // Try to get courses from cache
    const cachedCourses = await redisClient.get('all_courses');
    if (cachedCourses) {
      return res.json(JSON.parse(cachedCourses));
    }

    // If not in cache, get from database
    const courses = await Course.find();
    
    // Store in cache for 1 hour
    await redisClient.setEx('all_courses', 3600, JSON.stringify(courses));

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
};

exports.getCoursesByTeacher = async (req, res) => {
  try {
    const { teacher_id } = req.params;
    const redisClient = getRedisClient();
    
    // Try to get from cache
    const cacheKey = `teacher_courses:${teacher_id}`;
    const cachedCourses = await redisClient.get(cacheKey);
    if (cachedCourses) {
      return res.json(JSON.parse(cachedCourses));
    }

    // If not in cache, get from database
    const courses = await Course.find({ teacher_id });
    
    // Store in cache for 1 hour
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(courses));

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teacher courses', error: error.message });
  }
};
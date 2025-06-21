const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

router.post('/', courseController.createCourse);
router.get('/', courseController.getAllCourses);
router.get('/teacher/:teacher_id', courseController.getCoursesByTeacher);


module.exports = router;
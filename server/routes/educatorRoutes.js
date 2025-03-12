import express from 'express'
import { addCourse, deleteCourse, editCourse, educatorDashboardData, getCourseById, getEducatorCourses, getEnrolledStudentsData, updateRoleToEducator } from '../controllers/educatorController.js'
import upload from '../configs/multer.js'
import { procetEducator } from '../middlewares/authMiddleware.js'

const educatorRouter = express.Router()

// Add Educator Role
educatorRouter.get('/update-role', updateRoleToEducator)
educatorRouter.post('/add-course', upload.single('image'),procetEducator, addCourse)
educatorRouter.get('/courses', procetEducator, getEducatorCourses)
educatorRouter.get('/dashboard', procetEducator, educatorDashboardData)
educatorRouter.get('/enrolled-students', procetEducator, getEnrolledStudentsData)
educatorRouter.get("/course/:id", procetEducator, getCourseById);
educatorRouter.put("/course/:id", upload.single('image'), procetEducator, editCourse);
educatorRouter.delete("/delete-course/:id",  procetEducator, deleteCourse);



export default educatorRouter 
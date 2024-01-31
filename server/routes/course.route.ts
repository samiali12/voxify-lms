import express from 'express'
import { authorizeRoles, isAuthenticated } from '../middleware/auth'
import { addQuestions, courseUpload, deleteCourse, getAllCourses, getCourseByUser, getSingleCourse, replyQuestions, updateCourse, addReview, replyReview, retrieveAllCourses } from '../controllers/course.controller'
const router = express.Router()

router.post("/create-course", isAuthenticated, authorizeRoles("admin"), courseUpload)
router.put("/update-course/:id", isAuthenticated, authorizeRoles("admin"), updateCourse)
router.delete("/delete-course/:id", isAuthenticated, authorizeRoles("admin"), deleteCourse)

// get single course without purchasing
router.get("/courses/:id", getSingleCourse)
router.get("/courses", getAllCourses)

router.get("/get-course-content/:id", getCourseByUser)
router.post("/course/:id/add-question", isAuthenticated, addQuestions)
router.post("/course/:id/reply-question", isAuthenticated, replyQuestions)

router.post("/course/:id/add-review",  isAuthenticated, addReview)
router.post("/course/reply-review", isAuthenticated, replyReview)

router.get("/get-all-courses", retrieveAllCourses)

export default router;
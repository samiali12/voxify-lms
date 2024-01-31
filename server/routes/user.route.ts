import express, { NextFunction, Request, Response } from 'express'
import { activateUser, getUserInfo, updateAccessToken, updateProfilePicture, updateUserInfo, deleteUser, updateUserPassword, userLogin, userLogout, userRegistration } from '../controllers/user.controller'
import { authorizeRoles, isAuthenticated } from '../middleware/auth'
const router = express.Router()

router.post("/registration", userRegistration)
router.post("/activate-user", activateUser)
router.post("/login", userLogin)
router.get("/logout", isAuthenticated, userLogout)
router.get("/refreshtoken", updateAccessToken)

router.get("/me/:id", isAuthenticated, getUserInfo)
router.post("/me/update-profile/:id", isAuthenticated, updateUserInfo)
router.post("/me/update-password", isAuthenticated, updateUserPassword)
router.post("/me/update-avatar", isAuthenticated, updateProfilePicture)
router.delete('/me/:userId', isAuthenticated, deleteUser);

export default router;
import express from 'express'
import { getDrivers, login, logout, profile, register, sendOTP, verifyOTP } from '../contollers/auth.controller.js'

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)
router.post("/profile", profile)
router.post("/get-otp", sendOTP)
router.post("/verify-otp", verifyOTP)
router.get("/drivers", getDrivers)


export default router
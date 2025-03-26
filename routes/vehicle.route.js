import express from 'express'
import { addVehicle, getAllVehicles, getTotalPaymentsAndCashback, getVehicleById, updatePaymentMethod } from '../contollers/vehicle.controller.js'

const router = express.Router()

router.post("/add", addVehicle)
router.get("/get/:id", getVehicleById)
router.get("/get", getAllVehicles)
router.get("/get-statstics", getTotalPaymentsAndCashback)
// router.post("/update-payment/:id", updatePayment)
router.post("/update-payment-method/:id", updatePaymentMethod)



export default router
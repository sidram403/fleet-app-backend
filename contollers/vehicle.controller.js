import { Payment } from "../models/payment.model.js";
import Vehicle from "../models/vehicle.model.js";

export const addVehicle = async (req, res) => {
  try {
    const { vehicleNumber, otherDetails, assignedDriver } = req.body;

    const existingVehicle = await Vehicle.findOne({ vehicleNumber });

    if (existingVehicle) {
      return res
        .status(400)
        .json({ message: "Vehicle with this number already exists!" });
    }
    const lastFuelFilled = new Date();

    const newVehicle = new Vehicle({
      vehicleNumber,
      otherDetails,
      assignedDriver,
      lastFuelFilled,
    });
    await newVehicle.save();

    res
      .status(201)
      .json({
        message: "Vehicle Registered Successfully!",
        vehicle: newVehicle,
      });
  } catch (error) {
    console.error("Error adding vehicle:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findOne({ assignedDriver: id }).populate(
      "assignedDriver",
      "name email phoneNmber"
    ); // Populate driver details

    if (!vehicle) {
      return res
        .status(404)
        .json({ message: "No vehicle found for this driver" });
    }

    res.status(200).json(vehicle);
  } catch (error) {
    console.error("Error fetching vehicle details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const updatePaymentMethod = async (req, res) =>{
    try {
        const { id } = req.params; // Driver ID
        const { amount, paymentMethod, fuelType, extraNote } = req.body;

        const amountPaid = Number(amount);
    const rewards = amountPaid * 0.1; // 10% of the amount

    
        // Find the vehicle by assigned driver
        let vehicle = await Vehicle.findOne({ assignedDriver: id });
        if (!vehicle) {
          return res.status(404).json({ message: "Vehicle not found" });
        }
    
        // Create a new payment record
        const newPayment = new Payment({
          vehicle: vehicle._id,
          amount,
          paymentMethod,
          fuelType,
          extraNote,
        });
    
        await newPayment.save();
    
        // Update vehicle details
        vehicle.totalSpentOnFuel += Number(amount);
        vehicle.totalCashback += rewards
        vehicle.lastFuelFilled = new Date();
        vehicle.payments.push(newPayment._id); // Store reference to the payment
        vehicle.status="Offline"
    
        await vehicle.save();
    
        res.status(200).json({ message: "Payment updated successfully", newPayment , rewards});
      } catch (error) {
        console.error("Error updating payment:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
}

export const getAllVehicles = async (req, res) =>{
    try {
        // Fetch all vehicles and populate their associated payments
        const vehicles = await Vehicle.find().populate("payments");
    
        if (!vehicles || vehicles.length === 0) {
          return res.status(404).json({ message: "No vehicles found" });
        }
    
        res.status(200).json({ success: true, vehicles });
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
}

export const getTotalPaymentsAndCashback = async (req, res) => {
    try {
      // Fetch all vehicles along with their payments
      const vehicles = await Vehicle.find().populate("payments");
  
      if (!vehicles || vehicles.length === 0) {
        return res.status(404).json({ message: "No vehicles found" });
      }
  
      let grandTotalPayment = 0;
      let grandTotalCashback = 0;
      const vehicleSummary = [];
  
      // Loop through each vehicle
      vehicles.forEach((vehicle) => {
        let totalPayment = 0;
        let totalCashback = 0;
  
        // Sum up payments and cashback
        vehicle.payments.forEach((payment) => {
          totalPayment += payment.amount;
        });
        totalCashback += vehicle.totalCashback;
  
        // Update grand totals
        grandTotalPayment += totalPayment;
        grandTotalCashback += totalCashback;
  
        // Store vehicle-wise summary
        vehicleSummary.push({
          vehicleId: vehicle._id,
          totalPayment,
          totalCashback,
        });
      });
  
      res.status(200).json({
        message: "Total payments and cashback retrieved successfully",
        grandTotalPayment,
        grandTotalCashback,
        vehicleSummary,
      });
    } catch (error) {
      console.error("Error fetching total payments and cashback:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  
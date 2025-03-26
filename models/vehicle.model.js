import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
  vehicleNumber: { type: String, required: true, unique: true },
  otherDetails: { type: String },
  assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to Driver
  lastFuelFilled: { type: Date }, // New field
  totalSpentOnFuel: { type: Number, default: 0 }, // New field
  totalCashback: { type: Number, default: 0 }, // New field
  status: { type: String, enum: ["Active", "Idle", "Offline"], default: "Active" }, 
  currentLocation: {
    locationName: { type: String, default: "Unknown" },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
  },
  payments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],
});

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

export default Vehicle

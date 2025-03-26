import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["Cash", "Card", "Banking", "UPI"], default: "Cash" },
  fuelType: { type: String, enum: ["Petrol", "Diesel", "Electric"], required: true },
  extraNote: { type: String },
  date: { type: Date, default: Date.now }, // Stores when payment was made
});

export const Payment = mongoose.model("Payment", PaymentSchema);

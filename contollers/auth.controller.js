import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import twilio from "twilio";
import Vehicle from "../models/vehicle.model.js";

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();
// Register User with Role
export const register = async (req, res) => {
  const { name, email, password, phoneNumber, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword, phoneNumber, role });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ token, user: { id: user._id, name, email, phoneNumber, role } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Login User
export const login = async (req, res) => {
  try {
    const { email, password, locationName, latitude, longitude } = req.body;

    // Find the user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Validate password (Assuming bcrypt is used)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    // Find the vehicle assigned to this user
    const vehicle = await Vehicle.findOne({ assignedDriver: user._id });

    if (vehicle) {
      // Update vehicle's current location
      vehicle.currentLocation = { locationName, latitude, longitude };
      await vehicle.save();
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.status(200).json({
      token:token,
      message: "Login successful",
      user,
      vehicle: vehicle ? vehicle : null,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
  
export const profile = async (req, res) =>{
    const {token} = req.body;

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET)
        const userId = user.id

        const userDetails = await User.findOne({ _id:userId });
        res.json({
            message :"Fetched user details",
            user: {
              id: userDetails._id,
              name: userDetails.name,
              email: userDetails.email,
              phoneNumber: userDetails.phoneNumber,
              role: userDetails.role,
            },
          });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}  

export const sendOTP = async (req, res) =>{
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ message: "Phone number is required" });
    
    try {
      const user = await User.findOne({ phoneNumber });
      if (!user) return res.status(404).json({ message: "User not found" });
    
      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes
    
      // ✅ Update OTP fields without affecting mandatory fields
      await User.findByIdAndUpdate(user._id, { otp, otpExpiresAt });
    
      // Send OTP via SMS (Using Twilio)
      await twilioClient.messages.create({
        body: `Your OTP is: ${otp}`,
        from: TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });
    
      res.json({ message: "OTP sent successfully" });
    
    } catch (error) {
      console.error("Error sending OTP:", error);
      res.status(500).json({ message: "Failed to send OTP" });
    }
}

export const verifyOTP = async (req, res) =>{
    const { phoneNumber, otp } = req.body;
  if (!phoneNumber || !otp) return res.status(400).json({ message: "Phone number and OTP are required" });

  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.otp !== otp || new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user._id, phoneNumber: user.phoneNumber, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Clear OTP after successful login
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.json({ message: "Login successful", token, user: { id: user._id, phoneNumber: user.phoneNumber, role: user.role } });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
}

export const getDrivers = async(req, res) =>{
  try {
    const drivers = await User.find({ role: "driver" });
    res.status(200).json(drivers);
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
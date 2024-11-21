import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        success: false,
        message: "Data Missing"
      });
    }

    // checking if user exist
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found!"
      });
    }

    // check if password match
    const isMatch = await bcrypt.compare(password, user?.password);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = createToken(user?._id);
    res.json({
      success: true,
      token
    });
  } catch (err) {
    console.log("error from loginUser in userController ", err);
    res.json({
      success: false,
      message: err.message
    });
  }
};

// Route for user registration
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.json({
        success: false,
        message: "Data Missing"
      });
    }

    // checking if user already exist
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({
        success: false,
        message: "User already exist!"
      });
    }

    // check if email and password is valid
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Enter a valid email"
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Enter a strong password"
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword
    });

    const user = await newUser.save();

    // token
    const token = createToken(user?._id);

    res.json({
      success: true,
      token
    });
  } catch (err) {
    console.log("error from registerUser in userController : ", err);
    res.json({
      success: false,
      message: err.message
    });
  }
};

// Route for admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.json({
        success: false,
        message: "Invalid Credentials"
      });
    }

    const token = jwt.sign(email + password, process.env.JWT_SECRET);
    res.json({
      success: true,
      token
    });
  } catch (err) {
    console.log("error from adminLogin in userController ", err);
    res.json({
      success: false,
      message: err.message
    });
  }
};

export { loginUser, registerUser, adminLogin };

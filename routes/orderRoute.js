import express from "express";
import {
  allOrders,
  placeOrder,
  placeOrderRazorpay,
  placeOrderStripe,
  updateStatus,
  userOrders,
  verifyRazorpay,
  verifyStripe
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";

const OrderRouter = express.Router();

// ADMIN FEATURES
OrderRouter.post("/list", adminAuth, allOrders);
OrderRouter.post("/status", adminAuth, updateStatus);

// PAYMENT FEATURES

OrderRouter.post("/place", authUser, placeOrder);
OrderRouter.post("/stripe", authUser, placeOrderStripe);
OrderRouter.post("/razorpay", authUser, placeOrderRazorpay);

// USER FEATURES
OrderRouter.post("/userorders", authUser, userOrders);

// VERIFY PAYMENT
OrderRouter.post("/verifyStripe", authUser, verifyStripe);
OrderRouter.post("/verifyRazorpay", authUser, verifyRazorpay);

export default OrderRouter;

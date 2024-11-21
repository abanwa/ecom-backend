import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import razorpay from "razorpay";

// global variables
const currency = "usd";
const deliveryCharge = 25;

//gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Placing order using COD (cash on delivery) method
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    if (!userId || !items || !amount || !address) {
      return res.json({
        success: false,
        message: "Missing order data"
      });
    }

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now()
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // we will empty/clear the user cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({
      success: true,
      message: "Order Placed"
    });
  } catch (err) {
    console.log("error from placeOder in orderController ", err);
    res.json({
      success: false,
      message: err.message
    });
  }
};

// Placing order using Stripe method
const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    const { origin } = req.headers;
    if (!userId || !items || !amount || !address) {
      return res.json({
        success: false,
        message: "Missing order data in stripe"
      });
    }

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now()
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const line_items = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item?.name
        },
        unit_amount: item?.price * 100
      },
      quantity: item?.quantity
    }));

    line_items.push({
      price_data: {
        currency: currency,
        product_data: {
          name: "Delivery Charges"
        },
        unit_amount: deliveryCharge * 100
      },
      quantity: 1
    });

    // if the payment is successful, we will be redirected to the success page while for the failed payment, we will be redirected to the failed page
    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder?._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder?._id}`,
      line_items,
      mode: "payment"
    });

    res.json({
      success: true,
      session_url: session?.url
    });
  } catch (err) {
    console.log("error from placeOderStripe in orderController ", err);
    res.json({
      success: false,
      message: err.message
    });
  }
};

// Verify Stripe
const verifyStripe = async (req, res) => {
  try {
    const { orderId, success, userId } = req.body;
    if (!userId || !orderId) {
      return res.json({
        success: false,
        message: "data missing"
      });
    }

    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      //we will clear the cart Data of the user
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.json({
        success: true
      });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({
        success: false
      });
    }
  } catch (err) {
    console.log("error from verifyStripe in orderController ", err);
    res.json({
      success: false,
      message: err.message
    });
  }
};

// Placing order using placeOderRazorpay method
const placeOrderRazorpay = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    if (!userId || !items || !amount || !address) {
      return res.json({
        success: false,
        message: "Missing order data in stripe"
      });
    }

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Razorpay",
      payment: false,
      date: Date.now()
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const options = {
      amount: amount * 100,
      currency: currency.toUpperCase(),
      receipt: newOrder?._id.toString()
    };

    await razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
        console.log("error in razorpay : ", error);
        return res.json({
          success: false,
          message: error
        });
      }
      res.json({
        success: true,
        order
      });
    });
  } catch (err) {
    console.log("error from placeOderRazorpay in orderController ", err);
    res.json({
      success: false,
      message: err.message
    });
  }
};

const verifyRazorpay = async (req, res) => {
  try {
    const { userId, razorpay_order_id } = req.body;
    if (!userId || !razorpay_order_id) {
      return res.json({
        success: false,
        message: "Missing order data in razorpay verify"
      });
    }

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    // check if we have paid or if payment is completed
    if (orderInfo?.status === "paid") {
      // orderInfo?.receipt is the order id of that order
      await orderModel.findByIdAndUpdate(orderInfo?.receipt, { payment: true });
      // clear the user cartData
      await userModel.findByIdAndUpdate(userId, { cartData: {} });

      res.json({
        success: true,
        message: "Payment Successful"
      });
    } else {
      res.json({
        success: false,
        message: "Payment Failed"
      });
    }
  } catch (err) {
    console.log("error from verifyRazorpay in orderController ", err);
    res.json({
      success: false,
      message: err.message
    });
  }
};

// All Orders data for Admin Panel
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});

    res.json({
      success: true,
      orders
    });
  } catch (err) {
    console.log("error from allOrders in orderController ", err);
    res.json({
      success: false,
      message: err.message
    });
  }
};

// User Orders data for Frontend
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.json({
        success: false,
        message: "data missing"
      });
    }

    const orders = await orderModel.find({ userId });

    res.json({
      success: true,
      orders
    });
  } catch (err) {
    console.log("error from userOrders in orderController ", err);
    res.json({
      success: false,
      message: err.message
    });
  }
};

// Update order status for Admin panel
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.json({
        success: false,
        message: "data missing"
      });
    }

    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({
      success: true,
      message: "Status Updated"
    });
  } catch (err) {
    console.log("error from updateStatus in orderController ", err);
    res.json({
      success: false,
      message: err.message
    });
  }
};

export {
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
  verifyStripe,
  verifyRazorpay
};

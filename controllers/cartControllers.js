import userModel from "../models/userModel.js";

// Add products to user cart
const addToCart = async (req, res) => {
  try {
    // itemId is the productId (id of that specific product)
    const { userId, itemId, size } = req.body;
    if (!userId || !itemId || !size) {
      return res.json({
        success: false,
        message: "cart data missing"
      });
    }

    const userData = await userModel.findById(userId);
    let cartData = await userData?.cartData;

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({
      success: true,
      message: "Added to Cart"
    });
  } catch (err) {
    console.log("error from addToCart in cartController ", err);
    res.json({
      success: false,
      message: err.message
    });
  }
};

// Update products in user cart
const updateCart = async (req, res) => {
  try {
    // itemId is the productId (id of that specific product)
    const { userId, itemId, size, quantity } = req.body;
    if (!userId || !itemId || !size) {
      return res.json({
        success: false,
        message: "cart data missing"
      });
    }

    const userData = await userModel.findById(userId);
    let cartData = await userData?.cartData;

    // Update cartData
    cartData[itemId][size] = quantity;

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({
      success: true,
      message: "Cart Updated"
    });
  } catch (err) {
    console.log("error from updateCart in cartController ", err);
    res.json({
      success: false,
      message: err.message
    });
  }
};

// Get user cart data
const getUserCart = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.json({
        success: false,
        message: "cart data missing"
      });
    }

    const userData = await userModel.findById(userId);
    let cartData = await userData?.cartData;

    res.json({
      success: true,
      cartData
    });
  } catch (err) {
    console.log("error from getUserCart in cartController ", err);
    res.json({
      success: false,
      message: err.message
    });
  }
};

export { addToCart, updateCart, getUserCart };

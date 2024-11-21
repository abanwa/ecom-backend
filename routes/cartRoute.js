import express from "express";
import {
  addToCart,
  getUserCart,
  updateCart
} from "../controllers/cartControllers.js";
import authUser from "../middleware/auth.js";

const cartRouter = express.Router();

cartRouter.use(authUser);

cartRouter.post("/get", getUserCart);
cartRouter.post("/add", addToCart);
cartRouter.post("/update", updateCart);

export default cartRouter;

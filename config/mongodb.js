import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Database connected");
    });
    await mongoose.connect(`${process.env.MONGODB_URI}/ecommerceDB`);
  } catch (err) {
    console.log("mongoDB error : ", err);
  }
};

export default connectDB;

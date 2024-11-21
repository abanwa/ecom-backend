import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// Add Product
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller
    } = req.body;

    const image1 = req.files?.image1 && req.files?.image1[0];
    const image2 = req.files?.image2 && req.files?.image2[0];
    const image3 = req.files?.image3 && req.files?.image3[0];
    const image4 = req.files?.image4 && req.files?.image4[0];

    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !subCategory ||
      !sizes
    ) {
      return res.json({
        success: false,
        message: "Data Missing"
      });
    }

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined
    );

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image"
        });

        return result?.secure_url;
      })
    );

    const productData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: bestseller === "true" ? true : false,
      sizes: JSON.parse(sizes),
      image: imagesUrl,
      date: Date.now()
    };

    const product = new productModel(productData);
    await product.save();

    res.json({
      success: true,
      message: "Product Added"
    });
  } catch (err) {
    console.log("error from addProduct in productController ", err);
    res.json({
      success: false,
      message: err.message
    });
  }
};

// List Products
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({
      success: true,
      products
    });
  } catch (err) {
    console.log("error from listProducts in productController ", err);
    res.json({
      success: false,
      message: err.message
    });
  }
};

// Remove Product
const removeProduct = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.json({
        success: false,
        message: "Product ID missing"
      });
    }
    await productModel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Product removed"
    });
  } catch (err) {
    console.log("error from removeProduct in productController ", err);
    res.json({
      success: false,
      message: err.message
    });
  }
};

// single Product Info
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.json({
        success: false,
        message: "Product ID missing"
      });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return res.json({
        success: false,
        message: "Product not available"
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (err) {
    console.log("error from singleProduct in productController ", err);
    res.json({
      success: false,
      message: err.message
    });
  }
};

export { addProduct, listProducts, removeProduct, singleProduct };

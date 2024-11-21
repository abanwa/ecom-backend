import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.json({
        success: false,
        message: "Not authorized. Login Again"
      });
    }
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    // this token_decode?.id is the id we used when we created the token in the register and login
    req.body.userId = token_decode?.id;
    next();
  } catch (err) {
    console.log("error from auth.js in middleware in authUser ", err);
    res.json({
      success: false,
      message: err.message
    });
  }
};

export default authUser;

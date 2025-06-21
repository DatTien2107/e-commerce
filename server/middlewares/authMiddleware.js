// auth.js - Updated middleware để hỗ trợ cả cookies và headers
import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

// USER AUTH - FIXED để hỗ trợ cả cookies và Authorization header
export const isAuth = async (req, res, next) => {
  try {
    let token;

    // 1. Thử lấy từ cookies trước (cho web browsers)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log("Token from cookies:", token);
    }

    // 2. Nếu không có trong cookies, thử lấy từ Authorization header (cho mobile apps)
    if (!token && req.headers.authorization) {
      if (req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.substring(7); // Remove "Bearer " prefix
        console.log("Token from Bearer header:", token);
      } else {
        token = req.headers.authorization;
        console.log("Token from auth header:", token);
      }
    }

    // 3. Thử các header khác (backup)
    if (!token && req.headers["x-auth-token"]) {
      token = req.headers["x-auth-token"];
      console.log("Token from x-auth-token:", token);
    }

    // Validation
    if (!token) {
      return res.status(401).send({
        success: false,
        message: "UnAuthorized User - No token provided",
      });
    }

    console.log("Final token to verify:", token);

    // Verify token
    const decodeData = JWT.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token data:", decodeData);

    // Get user
    req.user = await userModel.findById(decodeData._id);

    if (!req.user) {
      return res.status(401).send({
        success: false,
        message: "User not found",
      });
    }

    console.log("Auth successful for user:", req.user._id);
    next();
  } catch (error) {
    console.log("Auth error:", error.message);
    return res.status(401).send({
      success: false,
      message: "Invalid token",
      error: error.message,
    });
  }
};

// ADMIN AUTH - Unchanged
export const isAdmin = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(401).send({
      success: false,
      message: "admin only",
    });
  }
  next();
};

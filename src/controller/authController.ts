import { Request, Response, NextFunction } from "express";
import { User } from "../model/userModel";
import { generateRefreshToken } from "../config/refreshToken";
import { generateToken } from "../config/jwtToken";
import asyncHandler from "../utils/asyncHandler";
import AppError from "../utils/appError";

export const signUp = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide name, email, and password" });
    }

    // Check if user with provided email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Create new user
    const newUser = new User({ name, email, password });
    await newUser.save();

    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error in sign up:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return next(
        new AppError("Please provide a valid email and password", 400)
      );
    }

    // Find user by email
    const user = await User.findOne({ email }).select("+password");

    // Check if user exists and password is correct
    if (
      !user ||
      !(await (user as any).isPasswordMatched(password, user.password))
    ) {
      return next(new AppError("Incorrect email or password", 401));
    }

    // Generate new refresh token
    const refreshToken = generateRefreshToken(user.id);
    // Update user with new refresh token
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { refreshToken },
      { new: true }
    );

    // Set refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000, // 72 hours
    });

    // Return success response with user details and token
    return res.json({
      _id: user._id,
      token: generateToken(user.id),
      status: "success",
      user: updatedUser,
    });
  }
);

// logout user
const logout = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ error: "No Refresh Token in Cookie" });
    }

    try {
      // Find user by refreshToken
      const user = await User.findOneAndUpdate(
        { refreshToken: refreshToken },
        { $unset: { refreshToken: "" } },
        { new: true }
      );
      if (!user) {
        return res
          .clearCookie("refreshToken")
          .json({ message: "User not found, but logout successful" });
      }

      return res
        .clearCookie("refreshToken", {
          httpOnly: true,
          secure: true,
        })
        .json({ message: "Logout successful" });
    } catch (error) {
      return res.status(500).json({ error: "Something went wrong" });
    }
  }
);

export default { signUp, login, logout };

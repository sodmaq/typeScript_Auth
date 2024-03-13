import { Request, Response, NextFunction } from "express";
import { User } from "../model/userModel";
import { Token } from "../model/tokenModel";
import { generateRefreshToken } from "../config/refreshToken";
import { generateToken } from "../config/jwtToken";
import asyncHandler from "../utils/asyncHandler";
import AppError from "../utils/appError";
import crypto from "crypto";
import { sendEmail } from "../utils/email";

export const signUp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return next(
          new AppError("Please provide name, email, and password", 400)
        );
      }
      // Check if user with provided email already exists
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return next(new AppError("User with this email already exists", 400));
      }

      // Create new user
      const newUser = new User({ name, email, password });
      await newUser.save();

      // Generate and save token
      const token = new Token({
        _userId: newUser._id,
        token: crypto.randomBytes(16).toString("hex"),
      });
      await token.save();

      // Send verification email
      const verificationText = `Hello ${newUser.name},\n\nPlease verify your account by clicking the link:\nhttp://${req.headers.host}/api/user/confirmation/${newUser.email}/${token.token}\n\nThank You!\n`;
      await sendEmail(
        newUser.email,
        "Account Verification Link",
        verificationText
      );

      res
        .status(201)
        .json({ message: "User created successfully", user: newUser });
    } catch (error) {
      console.error("Error in sign up:", error);
      return next(new AppError("Internal Server Error", 500));
    }
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return next(
        new AppError("Please provide a valid email and password", 400)
      );
    }

    try {
      // Find user by email
      const user = await User.findOne({ email }).select("+password");

      // Check if user exists
      if (!user) {
        return next(new AppError("User not found", 404));
      }

      // Check if user is verified
      if (!user.isVerified) {
        return res.status(401).json({
          msg: "Your email has not been verified. Please click on resend.",
        });
      }

      // Check if password is correct
      const isPasswordMatched = await (user as any).isPasswordMatched(password);

      if (!isPasswordMatched) {
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
    } catch (error) {
      
      return next(
        new AppError("Something went wrong, please try again later", 500)
      );
    }
  }
);
// logout user
export const logout = asyncHandler(
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

export const confirmEmail = asyncHandler(async (req: Request, res: Response, next: any) => {
  const tokenValue = req.params.token;
  const userEmail = req.params.email;

  const token = await Token.findOneAndDelete({ token: tokenValue });

  if (!token) {
    return next(new AppError('Your verification link may have expired. Please click on resend for verify your Email.', 400));
  }

  const user = await User.findOne({ _id: token._userId, email: userEmail });

  if (!user) {
    return next(new AppError('We were unable to find a user for this verification. Please SignUp!', 404));
  }

  if (user.isVerified) {
    return res.status(200).send('User has been already verified. Please Login');
  }

  user.isVerified = true;
  await user.save();

  return res.status(200).send('Your account has been successfully verified');
});

export const resendLink = asyncHandler(
  async (req: Request, res: Response, next: any) => {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
      return next(new AppError("Email is required", 400));
    }

    // Find the user by email
    const user = await User.findOne({ email });

    // If user does not exist, return error
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Check if user is already verified
    if (user.isVerified) {
      return next(new AppError("User is already verified", 400));
    }

    try {
      // Generate a new token
      const token = new Token({
        _userId: user._id,
        token: crypto.randomBytes(16).toString("hex"),
      });
      await token.save();

      // Send verification email with new token
      const verificationText = `Hello ${user.name},\n\nPlease verify your account by clicking the link:\nhttp://${req.headers.host}/api/user/confirmation/${user.email}/${token.token}\n\nThank You!\n`;

      await sendEmail(user.email, "Resend Verification Link", verificationText);

      return res
        .status(200)
        .json({ message: "Verification link has been resent" });
    } catch (error) {
      console.error("Error sending verification email:", error);
      return next(new AppError("Internal Server Error", 500));
    }
  }
);

export default { signUp, login, logout, confirmEmail, resendLink };

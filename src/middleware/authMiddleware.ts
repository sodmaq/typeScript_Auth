import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import asyncHandler from "../utils/asyncHandler";
import AppError from "../utils/appError";
import { User } from "../model/userModel";
import { load } from "ts-dotenv";
import { request } from "https";

const env = load({
  JWT_SECRET: String,
});

export const authMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
      try {
        if (token) {
          const decoded:any = jwt.verify(token, env.JWT_SECRET);
          const user = await User.findById(decoded.id);
          if (!user) {
            return next(new AppError("User not found", 404));
          }
          (req as any).user = user;
          next();
        }
      } catch (error) {
        return next(new AppError("Not authorized", 401));
      }
    } else {
      return next(new AppError("No token attached to the request", 401));
    }
  }
);
export default {authMiddleware};
import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import { load } from "ts-dotenv";

const env = load({
  NODE_ENV: String,
  PORT: Number,
});

const handleCastErrorDB = (err: any) => {
  const message = `Invalid ID: ${err.value} `;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: any) => {
  const field = Object.keys(err.keyPattern)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: ${field} with value: ${value}. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token, please login again", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired, please login again", 401);

const sendErrorDev = (err: any, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
  });
};

const sendErrorProd = (err: any, res: Response) => {
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      status: err.status || "error",
      message: err.message,
    });
  } else {
    console.error("Error", err);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

export default (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error: any = { ...err };
  error.message = err.message;

  if (err.name === "CastError") error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (err.name === "ValidationError") error = handleValidationErrorDB(error);
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

  if (env.NODE_ENV === "development") {
    sendErrorDev(error, res);
  } else if (env.NODE_ENV === "production") {
    sendErrorProd(error, res);
  }
};

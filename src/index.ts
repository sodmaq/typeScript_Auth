import express, { Request, Response, NextFunction } from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import AppError from "./utils/appError";
import globalErrorHandler from "./controller/errorController";

// router
import authRoute from "./routes/authRoute";

// Create Express App
const app = express();
app.use(morgan("dev"));

app.use(
  cors({
    credentials: true,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // Parse JSON bodies
app.use(cookieParser());
app.use(compression());

// app.all("*", (req: Request, res: Response, next: NextFunction) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
// });

// Error handling middleware
app.use(globalErrorHandler);

// Define route
app.use("/api/user", authRoute);

export { app };

import express, { Request, Response } from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";

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

// Define route
app.use("/api/user", authRoute);

export { app };

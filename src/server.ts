import mongoose from "mongoose";
// import dotenv from "dotenv";
import { load } from "ts-dotenv";

const env = load({
  DATABASE: String,
  PORT: Number,
});

// Connect to MongoDB using mongoose
const mongo_url = env.DATABASE;
if (!mongo_url) {
  throw new Error("MongoDB URL is not provided in the environment variables");
}

mongoose.Promise = global.Promise;
mongoose.connect(mongo_url);

// Check for successful MongoDB connection
mongoose.connection.on("connected", () => {
  console.log("MongoDB connected successfully");
});

// Check for MongoDB connection errors
mongoose.connection.on("error", (error: Error) => {
  console.error("MongoDB connection error:", error);
});
import { app } from "./index";
import { assert } from "console";

// Start the Express server
const port = env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

server.on("error", (error: Error) => {
  console.error("Server error:", error.message);
});

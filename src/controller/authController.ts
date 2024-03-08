import { Request, Response } from "express";
import { User } from "../model/userModel";

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

export const login = async (req: Request, res: Response) => {
  // Your login logic here
};

export const forgotPassword = async (req: Request, res: Response) => {
  // Your forgot password logic here
};

export default { signUp, login, forgotPassword };

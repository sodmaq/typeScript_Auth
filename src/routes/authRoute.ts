import { Router } from "express";
import authController from "../controller/authController";

const router = Router();

router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);

export default router;

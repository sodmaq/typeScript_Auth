import { Router } from "express";
import authController from "../controller/authController";

const router = Router();

router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get("/confirmation/:email/:token", authController.confirmEmail);
router.post("/resendLink", authController.resendLink);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/resetPassword/:token", authController.resetPassword);

export default router;

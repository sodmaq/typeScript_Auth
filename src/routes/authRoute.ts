import { Router } from "express";
import authController from "../controller/authController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get("/confirmation/:email/:token", authController.confirmEmail);
router.post("/resendLink",authMiddleware.authMiddleware, authController.resendLink);
router.post("/forgotPassword", authController.forgotPassword);
router.post("/resetPassword/:token", authController.resetPassword);

export default router;

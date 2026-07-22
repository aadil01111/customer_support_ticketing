import { Router } from "express";
import * as AuthController from "../controllers/authController.js";
import { registerRules, loginRules, validate } from "../validators/authValidator.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", registerRules, validate, AuthController.register);
router.post("/login", loginRules, validate, AuthController.login);
router.get("/me", protect, AuthController.getMe);

export default router;

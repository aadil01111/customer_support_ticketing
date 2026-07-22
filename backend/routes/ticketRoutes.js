import { Router } from "express";
import * as TicketController from "../controllers/ticketController.js";
import {
  createTicketRules,
  updateTicketRules,
  commentRules,
  validate,
} from "../validators/ticketValidator.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

router.get("/", TicketController.getAllTickets);
router.post("/", createTicketRules, validate, TicketController.createTicket);
router.get("/:id", TicketController.getTicketById);
router.put("/:id", updateTicketRules, validate, TicketController.updateTicket);
router.delete("/:id", restrictTo("admin"), TicketController.deleteTicket);
router.post("/:id/comments", commentRules, validate, TicketController.addComment);

export default router;

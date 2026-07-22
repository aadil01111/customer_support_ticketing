import { body, validationResult } from "express-validator";

export const createTicketRules = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),
  body("category").optional().trim(),
];

export const updateTicketRules = [
  body("status")
    .optional()
    .isIn(["open", "in-progress", "resolved", "closed"])
    .withMessage("Invalid status"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),
  body("assignedTo").optional().isMongoId().withMessage("Invalid agent id"),
];

export const commentRules = [
  body("text").trim().notEmpty().withMessage("Comment text is required"),
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

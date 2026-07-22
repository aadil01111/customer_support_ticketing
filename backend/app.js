import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/authRoutes.js";
import ticketRouter from "./routes/ticketRoutes.js";
import dbConnection from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/tickets", ticketRouter);

app.get("/", (req, res) => {
  res.json({
    message: "HelpDeskLite backend is running",
  });
});

// 404 + error handling
app.use(notFound);
app.use(errorHandler);

// Start server after DB connection
const startServer = async () => {
  try {
    await dbConnection();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Server failed to start:", error.message);
  }
};

startServer();

import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cors from "cors";
import emailRouter from "./routes/email.js";

dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development"
};

const app = express();

app.use(morgan("dev"));

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

// Health check endpoint for Cloud Run
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Email routes
app.use("/api/email", emailRouter);

app.listen(config.port, () => {
    console.log(`🚀 Server running on: http://localhost:${config.port}`);
    console.log(`📧 Email service available at: http://localhost:${config.port}/api/email`);
    });
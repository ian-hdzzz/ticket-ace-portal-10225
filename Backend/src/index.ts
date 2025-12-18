import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from './routes/auth.routes.js';
import ceaRouter from './routes/cea.routes.js';

dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development"
};

const app = express();

app.use(morgan("dev"));

// CORS configuration - allow frontend to make requests with credentials
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:8080",
  "http://localhost:8080",
  "http://localhost:5173", // Vite default
  "http://127.0.0.1:8080",
  "http://127.0.0.1:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      callback(null, true); // Allow for development - change to false in production
    }
  },
  credentials: true, // Allow cookies to be sent
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
// app.get("/", (req, res) => {
//   res.json({ mes('/cea', ceaRoutes)API is running", status: "ok" });
// });

// Routes
app.use('/auth', authRouter);
app.use('/api/cea', ceaRouter);

app.listen(config.port, () => {
    console.log(`✅ Server running on: http://localhost:${config.port}`);
    console.log(`📋 Environment: ${config.nodeEnv}`);
});
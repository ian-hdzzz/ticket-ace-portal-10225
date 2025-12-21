import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";

import emailRouter from "./routes/email.js";
import notificationRouter from "./routes/notifications.js";

import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from './routes/auth.routes.js';
import ceaRouter from './routes/cea.routes.js';
import { prisma } from './utils/prisma.js';


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
// Email routes
app.use("/api/email", emailRouter);
// Notification routes
app.use("/api/notifications", notificationRouter);

// Health check endpoint for Cloud Run
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.listen(config.port, async () => {
    console.log(`✅ Server running on: http://localhost:${config.port}`);
    console.log(`📋 Environment: ${config.nodeEnv}`);
    
    // Test database connection on startup
    console.log('\n🔍 Testing database connection...');
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully!');
    } catch (error: any) {
        console.error('❌ Database connection FAILED:');
        console.error('   Error:', error.message);
        console.error('   This will cause auth and other DB operations to fail!\n');
    }
});





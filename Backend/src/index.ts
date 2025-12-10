import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from './routes/auth.routes.js'

dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development"
};

const app = express();

app.use(morgan("dev"));

// CORS configuration - allow frontend to make requests with credentials
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:8080",
  credentials: true, // Allow cookies to be sent
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// app.get("/", (req, res) => {
//   res.send("Servidor funcionando");
// });

app.use('/auth', authRouter)

app.listen(config.port, () => {
    console.log(` Server running on: http://localhost:${config.port}`);
    });
import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRouter from './routes/auth.routes.js'

dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development"
};

const app = express();

app.use(morgan("dev"));

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
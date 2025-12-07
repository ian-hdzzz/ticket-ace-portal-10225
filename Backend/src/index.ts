import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";

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

app.get("/", (req, res) => {
  res.send("Servidor funcionando");
});

app.listen(config.port, () => {
    console.log(` Server running on: http://localhost:${config.port}`);
    });
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDb from "./config/db.js";
import path from "path";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authroutes.js";
import userRouter from "./routes/userroutes.js";
import shopRouter from "./routes/shoproutes.js";
import itemRouter from "./routes/itemroutes.js";

import cors from "cors";
const app = express();
const port = process.env.PORT || 8000;

const allowedOrigin = ["http://localhost:5173", "http://localhost:5174"];
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);

const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);

const NODE_ENV = process.env.NODE_ENV;
// make our app ready for deployment
if (NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.get("/", (req, res) => {
  res.send("Vingo server is running");
});
app.listen(port, () => {
  connectDb();
  console.log(`Server is running on port: ${port}`);
});

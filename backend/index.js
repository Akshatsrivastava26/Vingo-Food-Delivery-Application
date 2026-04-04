import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDb from "./config/db.js";
import path from "path";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import authRouter from "./routes/authroutes.js";
import userRouter from "./routes/userroutes.js";
import shopRouter from "./routes/shoproutes.js";
import itemRouter from "./routes/itemroutes.js";
import orderRouter from "./routes/orderroutes.js";
import http from "http";
const allowedOrigin = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

import cors from "cors";
import { Server } from "socket.io";
import { socketHandler } from "./socket.js";

const app = express();
const port = process.env.PORT || 8000;
const server = http.createServer(app);
const NODE_ENV = process.env.NODE_ENV;

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    credentials: true,
    methods: ["POST", "GET"],
  },
});

app.set("io", io);

if (NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === "production" ? 300 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === "production" ? 40 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many auth attempts, please try again later." },
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigin.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(
  helmet({
    contentSecurityPolicy:
      NODE_ENV === "production"
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://checkout.razorpay.com",
                "https://apis.google.com",
                "https://securetoken.googleapis.com",
              ],
              connectSrc: [
                "'self'",
                "https://api.geoapify.com",
                "https://securetoken.googleapis.com",
                "https://identitytoolkit.googleapis.com",
                "https://*.googleapis.com",
                "wss:",
                "ws:",
              ],
              imgSrc: ["'self'", "data:", "blob:", "https:"],
              styleSrc: ["'self'", "'unsafe-inline'", "https:"],
              fontSrc: ["'self'", "data:", "https:"],
              frameSrc: ["'self'", "https://checkout.razorpay.com"],
            },
          }
        : false,
  }),
);
app.use(compression());
app.use(globalLimiter);

const __dirname = path.resolve();

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);

socketHandler(io);
// make our app ready for deployment
if (NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // Serve SPA index for non-API routes.
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.get("/", (req, res) => {
  res.send("Vingo server is running");
});
server.listen(port, () => {
  connectDb();
  console.log(`Server is running on port: ${port}`);
});

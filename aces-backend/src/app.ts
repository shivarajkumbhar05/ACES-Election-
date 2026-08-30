import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import { env } from "./config/env";
import { globalLimiter } from "./middleware/rateLimit";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler";

import electionRoutes from "./routes/electionRoutes";
import positionRoutes from "./routes/positionRoutes";
import candidateRoutes from "./routes/candidateRoutes";
import votingRoutes from "./routes/votingRoutes";
import adminRoutes from "./routes/adminRoutes";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());

// Allow multiple origins for development and production
const allowedOrigins = [
  env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
}
app.use(globalLimiter);

app.get("/api/health", (req, res) => {
  res.json({ success: true, data: { status: "ok", service: "ACES Election Portal API" } });
});

app.use("/api/elections", electionRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/voting", votingRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

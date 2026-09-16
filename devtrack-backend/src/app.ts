import express from "express";
import cors from "cors";
import studyDayRoutes from "./routes/studyDayRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import completionRoutes from "./routes/completionRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5501",
      "http://127.0.0.1:5501",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://devtrack-svg7.onrender.com",
    ],
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "DevTrack API is running 🚀",
  });
});

app.use("/api/study-days", studyDayRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/completions", completionRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/projects", projectRoutes);

export default app;
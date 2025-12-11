// server.js (or index.js)
import dotenv from "dotenv";
dotenv.config({ override: true });

import express from "express";
import cors from "cors";
import { connectDB } from "./lib/db.js"; 
import productRoutes from "./routes/productRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import catalogueRoutes from "./routes/catalogueRoutes.js";
import contactFormRoutes from "./routes/contactFormRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import homeMetaRoutes from "./routes/homeMetaRoutes.js";
import ownerRoutes from "./routes/ownerRoutes.js";

const app = express();

// ✅ Middlewarea
app.use(express.json());

// ✅ Serve uploaded images & files
app.use("/uploads", express.static("uploads"));

// ✅ Allowed origins (from .env or fallback)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(origin => origin.trim())
  : ["https://architylezz.com"]; // production fallback

// ✅ CORS setup for dev + prod
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests from localhost (any port) or 127.0.0.1
    if (!origin || origin.startsWith("http://localhost:") || origin.startsWith("http://127.0.0.1:")) {
      return callback(null, true);
    }

    // Allow production domains
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error(`❌ Blocked by CORS: ${origin}`);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// ✅ Health check
app.get("/", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

// ✅ Routes
app.use("/api/products", productRoutes);
app.use("/api/catalogues", catalogueRoutes);  
app.use("/api/projects", projectRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/contact-forms", contactFormRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/home-meta", homeMetaRoutes);
app.use("/api/owner", ownerRoutes);

// ✅ Start Server
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`✅ Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ DB connection failed", err.message);
    process.exit(1);
  });

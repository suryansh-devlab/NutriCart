import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDb from "./src/config/db/db.js";
import errorHandler from "./src/middleware/errorMiddleware.js";
import consumerRoutes from "./src/routes/consumer/consumer.routes.js";

dotenv.config({
  path: "./.env",
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(errorHandler);

connectDb();

app.use("/api/consumer", consumerRoutes);

app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend is working 🚀",
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

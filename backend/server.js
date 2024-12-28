import express from "express"
import dotenv from "dotenv";
import authRoutes from "./routes/auth_routes.js";
import connectDB from "./database/connectDB.js";

dotenv.config();
const app = express();
const PORT =  process.env.PORT || 3000;

app.use("/api/auth", authRoutes);

app.listen (PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})
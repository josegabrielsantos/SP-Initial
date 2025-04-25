import express from "express"
import dotenv from "dotenv";
import authRoutes from "./routes/auth_routes.js";
import userRoutes from "./routes/user_routes.js";
import postRoutes from "./routes/post_routes.js";
import organizationRoutes from "./routes/organization_routes.js";
import paperRoutes from "./routes/paper_routes.js";
import connectDB from "./database/connectDB.js";
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from "cloudinary";
import { syncExistingData } from './elastic/elastic_client.js'

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const app = express();
const PORT =  process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/paper", paperRoutes);

app.listen (PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
    syncExistingData();
})
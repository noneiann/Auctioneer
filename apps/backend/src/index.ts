import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/AuthRoutes";
import * as fs from "fs";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Hello, World!");
});

app.use("/auth", authRoutes);

app.listen(4000, () => {
	console.log("Backend running at http://localhost:4000");
});

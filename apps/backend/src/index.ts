import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Hello, World!");
});

app.listen(4000, () => {
	console.log("Backend running at http://localhost:4000");
});

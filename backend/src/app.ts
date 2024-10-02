import express from "express";
import { connectDB } from "./utils/dbConnection.js";

const app = express();
const port = 3000;

connectDB();

app.use(express.json());

// Importing Routes
import userRoute from "./routes/user.route.js"
import { errorMiddleware } from "./middlewares/error.js";

// Using Routes
app.get("/", (req, res) => {
    res.send("API working with /api/v1")
})

app.use("/api/v1/user", userRoute);

app.use(errorMiddleware);

app.listen(port, () => {
    console.log(`Server is working on http://localhost:${port}`);
})
import express from "express";
import cors from "cors";
import pothRouter from './routes/pothhole.route'
const app = express();
const Port = process.env.PORT;
app.use(cors());
app.use(express.json());
app.use("/api",pothRouter)
app.get("/health", (req, res) => {
  res.json({
    status: "Roadsense API Running",
  });
});

export default app;

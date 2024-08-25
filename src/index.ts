import * as dotenv from "dotenv";
dotenv.config();
import morgan from "morgan";
import express from "express";
import cors from "cors";
import indexRoutes from "./routes/index.routes";
import { initEvictionStrategy } from "./shortener/limiter";
import Producer from "./shortener/queues/producer";
import ConsumerService from "./shortener/queues/consumer";

const app: express.Application = express();

app.use(cors());
app.use(express.json());
app.set("trust proxy", true);
app.use(morgan("dev"));

app.use("/", indexRoutes);

const PORT = process.env.PORT || 4000;

export const rateLimitMap = new Map();

initEvictionStrategy();

export const queue: any = [];
export const producer = new Producer(queue);
export const consumer = new ConsumerService(queue, 5000);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

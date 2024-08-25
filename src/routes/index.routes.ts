import { Router } from "express";
import shortenerRouter from "../shortener/routes";

const router = Router();

/**
 * BASE ROUTE
 */
router.use("/", shortenerRouter);

export default router;

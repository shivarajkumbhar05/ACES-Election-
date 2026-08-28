import { Router } from "express";
import { listPositions } from "../controllers/positionController";

const router = Router();
router.get("/", listPositions);

export default router;

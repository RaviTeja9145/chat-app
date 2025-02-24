import express from "express";
import { protectRoute } from "../middleware/auth.middlewaare.js";
import {
	getUsersForSidebar,
	getMessages,
	sendMessage,
} from "../controller/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

export default router;

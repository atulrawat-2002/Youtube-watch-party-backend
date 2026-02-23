import express from "express";
import { createRoomController } from "../controllers/createRoomController.js";




export const roomRouter = express.Router();

roomRouter.post('/create', createRoomController);

import { nanoid } from "nanoid";
import { createRoom } from "../configs/roomConfig.js";

export async function createRoomController(req, res) {

    const { username } = req.body;
    const roomId = nanoid(10);
    const room = createRoom(roomId, username);

    res.json({
        roomId: roomId,
        room: room,
        joinLink: `/room/${roomId}`
    })

}
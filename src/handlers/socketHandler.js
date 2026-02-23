import { getRoom, rooms } from "../configs/roomConfig.js";

export function socketHandler(io) {
  io.on("connection", (socket) => {
    // For joining a roome
    const { roomId, username, role, time } = socket.handshake.auth;

    if (!roomId) {
      socket.emit("error", { message: "NO roomId" });
      console.log("No roomId");
      return;
    }

    const room = getRoom(roomId);

    if (!room) {
      socket.emit("error", { message: "NO room found" });
      console.log("No room found");
      return;
    }

    room.sockets.add(socket);

    room.participants.set(socket.id, {
      username,
      role: role,
    });

    const videoId = room.videoId;
    const currentTime = room.currentTime;
    room.lastUpdate = Date.now();
    const elapsed = room.isPlaying ? (Date.now() - room.lastUpdate) / 1000 : 0;
    const actualCurrentTime = time + elapsed;

    socket.join(roomId);

    const participantsArray = Array.from(room.participants.entries()).map(
      ([socketId, data]) => ({
        socketId,
        username: data.username,
        role: data.role,
      }),
    );

    io.to(roomId).emit("roomJoined", {
      participants: participantsArray,
      videoId: videoId,
      isPlaying: room.isPlaying,
      currentTime: actualCurrentTime,
      roomId: roomId,
      lastUpdate: room.lastUpdate,
    });

    // for changin the video

    socket.on("changeVideo", ({ videoId, roomId }) => {
      const room = getRoom(roomId);
      room.videoId = videoId;
      room.lastUpdate = Date.now();
      // console.log("changing the video last update", room.lastUpdate, videoId, room.currentTime)

      io.to(roomId).emit("changeVideoSuccess", { videoId });
    });

    // for playing

    socket.on("play", ({ roomId, time }) => {
      const room = getRoom(roomId);
      if (!room) return;

      room.currentTime = time;
      room.isPlaying = true;
      room.lastUpdate = Date.now();
      // console.log("video play event last update", room.lastUpdate)
      io.to(roomId).emit("play", { time });
    });

    // for pause

    socket.on("pause", ({ roomId, time }) => {
      const room = getRoom(roomId);
      room.isPlaying = false;
      room.lastUpdate = Date.now();
      // console.log("video paused event last update", room.lastUpdate)
      io.to(roomId).emit("pause", { time });
    });

    // for seeking
    socket.on("seek", ({ roomId, time }) => {
      const room = getRoom(roomId);
      room.lastUpdate = Date.now();
      // console.log("video paused event last update", room.lastUpdate)
      io.to(roomId).emit("seek", { time });
    });

    socket.on("getRole", (roomId) => {
        const room = getRoom(roomId);

        console.log("roomid for getRole",roomId, "socket id", socket.id)

        const role = room.participants.get(socket.id)?.role

        socket.emit("getRole", role);

    })

    socket.on("remove-user", ({ roomId, targetSocketId }) => {
      const room = getRoom(roomId.roomId);

      if (!room) return;

      const requester = room.participants.get(socket.id);

      // Only Host can remove
      if (!requester || requester.role !== "Host") return;

      // Prevent removing Host
      if (room.participants.get(targetSocketId)?.role === "Host") return;

      // Remove from room map
      room.participants.delete(targetSocketId);

      // Remove from socket.io room
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        targetSocket.emit("removed");
        targetSocket.leave(roomId);
      }

      // Broadcast updated participants
      const participantsArray = Array.from(room.participants.entries()).map(
        ([socketId, data]) => ({
          socketId,
          username: data.username,
          role: data.role,
        }),
      );

      io.to(roomId.roomId).emit("participants-updated", participantsArray);
    });

    socket.on("make-moderator", ({ roomId, targetSocketId }) => {
      const room = getRoom(roomId.roomId);
      if (!room) return;

      const requester = room.participants.get(socket.id);

      // Only Host can promote
      if (!requester || requester.role !== "Host") return;

      const target = room.participants.get(targetSocketId);
      if (!target) return;

      // Update role
      target.role = "Moderator";

      // Broadcast updated participants to all in room
      const participantsArray = Array.from(room.participants.entries()).map(
        ([socketId, data]) => ({
          socketId,
          username: data.username,
          role: data.role,
        }),
      );

      io.to(roomId.roomId).emit("participants-updated", participantsArray);
    });
  });
}

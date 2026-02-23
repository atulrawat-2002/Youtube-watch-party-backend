


export const rooms = new Map();


export function createRoom (roomId, username) {

    const room = {

        participants: new Map(),
        videoId: null,
        isPlaying: false,
        currentTime: 0,
        sockets: new Set(),
        host: username,
        lastUpdate: 0,
    }

    rooms.set(roomId, room);
    return room;

}

export function getRoom(roomId) {
    const room = rooms.get(roomId);
    if (!room) return null;
    else return room;
}

export function deleteRoom(roomId) {
    rooms.delete(roomId);
}
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io"
import { PORT } from "./src/configs/serverConfig.js";
import morgan from "morgan";
import { roomRouter } from "./src/routes/roomRoutes.js";
import cors from "cors";
import { socketHandler } from "./src/handlers/socketHandler.js";


const app = express();
const server = createServer(app);
export const io = new Server(server, {
    cors: {
    origin: "*",
    methods: ["POST", "GET"],
  }
});

async function pingConnections() {

    const response = await fetch('https://youtube-watch-party-backend-l2m1.onrender.com/ping');
    console.log(response);

}

setInterval(async () => {
    await pingConnections()
}, 1000 * 60 * 10);

app.use(express.json());
app.use(morgan("dev"))
app.use(cors())

app.use('/api/rooms', roomRouter)
socketHandler(io);

app.get('/ping', (req, res) => {
  res.status(200).json({
    message: 'ok'
  })
})


server.listen(PORT, () => {

    console.log("App is listening on port number 3000")

})
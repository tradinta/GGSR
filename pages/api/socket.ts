import { Server } from "socket.io";

export default function SocketHandler(req: any, res: any) {
    if (res.socket.server.io) {
        console.log("Socket is already running");
    } else {
        console.log("Socket is initializing");
        const io = new Server(res.socket.server, {
            path: "/api/socket",
            addTrailingSlash: false,
        });
        res.socket.server.io = io;

        io.on("connection", (socket) => {
            console.log("Client connected", socket.id);

            const userId = socket.handshake.query.userId;
            if (userId) {
                socket.join(userId); // Join a room for this user
            }

            socket.on("message", (msg) => {
                // Broadcast to admin room (not impl yet) or echo back
                // For verify purpose, just echo back as "Admin" after delay
                if (msg.sender === "user") {
                    setTimeout(() => {
                        socket.emit("message", {
                            sender: "admin",
                            text: "We received your message. An agent will be with you shortly.",
                            timestamp: Date.now()
                        });
                    }, 1000);
                }
            });
        });
    }
    res.end();
}

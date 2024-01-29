const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

const roomMaps = {};
const roomTurns = {};
const roomColours = {};
const roomSelected = {};
const roomWinner = {};

function getClientsInRoom(io, roomId) {
    const room = io.sockets.adapter.rooms.get(roomId);
    return room ? room.size : 0;
}

function calcFight(node1, node2, room) {
    let num = Math.random();
    let diff = node1.units - node1.units;
    if (diff === 0) {
        if (num <= 0.5) {
            node1.units = 1;
            node2.units = 1;
        } else {
            node1.units = 1;
            node2.units = 1;
            node2.color = node1.color;
        }
    } else if (diff === 1) {
        if (num <= 0.25) {
            node1.units = 1;
            node2.units = 1;
        } else {
            node1.units = 1;
            node2.units = 1;
            node2.color = node1.color;
        }
    } else if (diff > 1) {
        node1.units = 1;
        node2.units = 1;
        node2.color = node1.color;
    } else if (diff === -1) {
        if (num <= 0.75) {
            node1.units = 1;
            node2.units = 1;
        } else {
            node1.units = 1;
            node2.units = 1;
            node2.color = node1.color;
        }
    } else if (diff < -1) {
        node2.units -= node1.units;
        node1.units = 1;
    }
}

function move(data, room, socket) {
    let clickedNode = roomMaps[room][data - 1];
    if (roomColours[room] == socket && roomTurns[room] == "blue") {
        if (clickedNode.color === "blue") {
            roomSelected[room] = clickedNode;
        } else if (roomSelected[room] && roomSelected[room].color === "blue") {
            if (clickedNode.id in roomSelected[room].connections) {
                calcFight(roomSelected[room], clickedNode, room);
            }
        }
    } else if (roomColours[room] != socket.id && roomTurns[room] == "red") {
        if (data.color === "red") {
            roomSelected[room] = clickedNode;
        } else if (roomSelected[room] && roomSelected[room].color === "red") {
            if (data.id in roomSelected[room].connections) {
                calcFight(roomSelected[room], data, room);
            }
        }
    }
}

io.on("connection", (socket) => {
    console.log(`${socket.id} connected`);
    socket.on("join_room", (room) => {
        let room_size = getClientsInRoom(io, room);
        if (room_size === 0) {
            roomTurns[room] = "blue";
            roomColours[room] = socket.id;
            roomMaps[room] = [
                { id: 1, connections: [2, 4, 5], color: "blue", units: 2 },
                { id: 2, connections: [1, 3], color: "neutral", units: 0 },
                { id: 3, connections: [2, 5, 6], color: "neutral", units: 0 },
                { id: 4, connections: [1, 5], color: "neutral", units: 0 },
                {
                    id: 5,
                    connections: [1, 3, 4, 6, 7, 8],
                    color: "neutral",
                    units: 0,
                },
                { id: 6, connections: [3, 5, 9], color: "neutral", units: 0 },
                { id: 7, connections: [5], color: "neutral", units: 0 },
                { id: 8, connections: [5, 9], color: "neutral", units: 0 },
                { id: 9, connections: [6, 8], color: "red", units: 2 },
            ];
            socket.join(room);
            console.log(`${socket.id} joined ${room}`);
            if (socket.id == roomColours[room]) {
                socket.emit("player_id", "blue");
            } else {
                socket.emit("player_id", "red");
            }
            io.to(room).emit("map", roomMaps[room]);
            socket.emit("map", roomMaps[room]);
            socket.emit("turn", roomTurns[room]);
        } else if (room_size === 1) {
            if (!io.sockets.adapter.rooms.get(room).has(roomColours[room])) {
                roomColours[room] = socket.id;
            }
            socket.join(room);
            console.log(`${socket.id} joined ${room}`);
            if (socket.id == roomColours[room]) {
                socket.emit("player_id", "blue");
            } else {
                socket.emit("player_id", "red");
            }
            io.to(room).emit("map", roomMaps[room]);
            socket.emit("map", roomMaps[room]);
            io.to(room).emit("turn", roomTurns[room]);
            socket.emit("turn", roomTurns[room]);
        } else {
            socket.emit("full");
        }
        socket.on("selected", (data) => {
            move(data, room, socket.id);
        });
    });

    socket.on("leave_room", (room) => {
        socket.leave(room);
        console.log(`${socket.id} left ${room}`);
    });
});

server.listen(3001, () => {
    console.log("listening on *:3001");
});

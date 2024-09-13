// socketHandlers.js
const { getClientsInRoom, generateRoom, move } = require('./gameLogic');

const roomMaps = {};
const roomTurns = {};
const roomColours = {};
const roomSelected = {};
const roomWinner = {};
const roomPhase = {};
const roomTroops = {};
const roomSize = {};

function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`${socket.id} connected`);

        socket.on('join_room', (room) => {
            let room_size = getClientsInRoom(io, room);
            if (room_size === 0) {
                roomTroops[room] = 0;
                roomTurns[room] = 'blue';
                roomColours[room] = socket.id;
                let details = generateRoom();
                roomMaps[room] = details.map;
                roomSize[room] = details.size;
                roomPhase[room] = 'attack';
                socket.join(room);
                sendPlayerInfo(socket, room, 'blue');
            } else if (room_size === 1) {
                if (!io.sockets.adapter.rooms.get(room).has(roomColours[room])) {
                    roomColours[room] = socket.id;
                }
                socket.join(room);
                sendPlayerInfo(socket, room, 'red');
            } else {
                socket.emit('full');
            }
        });

        socket.on('endTurn', (data) => {
            handleEndTurn(io, data, roomMaps, roomTurns, roomTroops, roomSize, roomPhase);
        });

        socket.on('selected', (data) => {
            move(data[0], data[1], socket.id);
            emitAllData(io, data[1], roomMaps, roomTurns, roomSize);
        });

        socket.on('leave_room', (room) => {
            socket.leave(room);
            console.log(`${socket.id} left ${room}`);
        });
    });
}

handleEndTurn(io, data, roomMaps, roomTurns, roomTroops, roomSize, roomPhase) {
    if (data[0] == roomTurns[data[1]]) {
        if (roomTroops[data[1]] == 0) {
            for (let i = 0; i < roomMaps[data[1]].length; i++) {
                if (data[0] == roomMaps[data[1]][i].color) {
                    roomTroops[data[1]] += 1
                }
            }
        }
        move(-1, data[1], socket.id)
    }
    let count = 0
    for (let i = 0; i < roomMaps[data[1]].length; i++) {
        if ('blue' === roomMaps[data[1]][i].color) {
            count++
        }
    }
    if (count === 0) {
        roomTurns[data[1]] === 'blue' ? 'red' : 'blue'
    }
    count = 0
    for (let i = 0; i < roomMaps[data[1]].length; i++) {
        if ('red' === roomMaps[data[1]][i].color) {
            count++
        }
    }
    if (count === 0) {
        roomTurns[data[1]] === 'blue' ? 'red' : 'blue'
    }
    emitAllData(data[1])
}

function sendPlayerInfo(socket, room, playerColor) {
    socket.emit('player_id', playerColor);
    io.to(room).emit('map', [roomMaps[room], roomSize[room]]);
    socket.emit('map', [roomMaps[room], roomSize[room]]);
    socket.emit('turn', roomTurns[room]);
}

function emitAllData(io, room, roomMaps, roomTurns, roomSize) {
    io.to(room).emit('map', [roomMaps[room], roomSize[room]])
    socket.emit('map', [roomMaps[room], roomSize[room]])
    io.to(room).emit('turn', roomTurns[room])
    socket.emit('turn', roomTurns[room])
}

module.exports = {
    setupSocketHandlers,
};

// socketHandlers.js
const { getClientsInRoom, generateRoom, move } = require('./gameLogic');

// Room grid
const roomMaps = {};
// Who's turn is it (blue/red)
const roomTurns = {};
// Colours in the room (blue/red)
const roomColours = {};
// State of selected nodes
const roomSelected = {};
// Winner of a game if any
const roomWinner = {};
// Phase of the turn (Rally/Attack)
const roomPhase = {};
// Number of Rally troops that can be deployed
const roomTroops = {};


// Setup connections with clients
function setupSocketHandlers(io) {
    io.on('connection', (socket) => {
        console.log(`${socket.id} connected`)

        // When a new connection is received join the client to their specified room
        socket.on('join_room', (room) => {
            let room_size = getClientsInRoom(io, room)
            // Give them blue if it's an empty room
            if (room_size === 0) {
                // Initalise room state
                roomTroops[room] = 0
                roomTurns[room] = 'blue'
                roomColours[room] = socket.id
                let details = generateRoom()
                roomMaps[room] = details.map
                roomPhase[room] = 'attack'
                socket.join(room)
                console.log(`${socket.id} joined ${room}`)
                if (socket.id == roomColours[room]) {
                    socket.emit('player_id', 'blue')
                } else {
                    socket.emit('player_id', 'red')
                }
                emitAllData(room)
            // Give them red if a player already is in the room
            } else if (room_size === 1) {
                if (!io.sockets.adapter.rooms.get(room).has(roomColours[room])) {
                    roomColours[room] = socket.id
                }
                socket.join(room)
                console.log(`${socket.id} joined ${room}`)
                if (socket.id == roomColours[room]) {
                    socket.emit('player_id', 'blue')
                } else {
                    socket.emit('player_id', 'red')
                }
                emitAllData(room)
            // If more than 2 players let the client know the room is full
            } else {
                socket.emit('full')
            }
        })

        // When end turn is received
        socket.on('endTurn', (data) => {
            // Check if correct player ended turn
            if (data[0] == roomTurns[data[1]]) {
                // Increase rally number if rally number is 0
                if (roomTroops[data[1]] == 0) {
                    // Check how many nodes the player controls and increase rally number up to this number
                    for (let i = 0; i < roomMaps[data[1]].length; i++) {
                        if (data[0] == roomMaps[data[1]][i].color) {
                            roomTroops[data[1]] += 1
                        }
                    }
                }
                // Trigger turn/phase change
                move(-1, data[1], socket.id, roomMaps, roomPhase, roomTroops, roomSelected, roomColours, roomTurns)
            }

            // Check if one player won
            checkWinner(data[1]);
        })

        // When node is selected by a client process the selection
        socket.on('selected', (data) => {
            move(data[0], data[1], socket.id,  roomMaps, roomPhase, roomTroops, roomSelected, roomColours, roomTurns)
            emitAllData(data[1])
        })

        // When client leaves a room
        socket.on('leave_room', (room) => {
            socket.leave(room)
            console.log(`${socket.id} left ${room}`)
        })

        // Function for emitting all state data
        function emitAllData(room) {
            io.to(room).emit('map', [roomMaps[room]])
            socket.emit('map', [roomMaps[room]])
            io.to(room).emit('turn', roomTurns[room])
            socket.emit('turn', roomTurns[room])
            io.to(room).emit('state', roomPhase[room])
            socket.emit('state', roomPhase[room])
        }

        function checkWinner(room) {
            // Count number of blue nodes
            let blueCount = 0
            for (let i = 0; i < roomMaps[room].length; i++) {
                if ('blue' === roomMaps[room][i].color) {
                    blueCount++
                }
            }
            if (blueCount === 0) {
                roomTurns[room] = 'red'
            }
        
            // Count number of red nodes
            let redCount = 0
            for (let i = 0; i < roomMaps[room].length; i++) {
                if ('red' === roomMaps[room][i].color) {
                    redCount++
                }
            }
            if (redCount === 0) {
                roomTurns[room] = 'blue'
            }
        
            // Check if we have a winner
            if (blueCount === 0) {
                roomWinner[room] = 'red';
                io.to(room).emit('winner', 'red');
            } else if (redCount === 0) {
                roomWinner[room] = 'blue';
                io.to(room).emit('winner', 'blue');
            } else {
                // If no winner, continue the game
                emitAllData(room);
            }
        }
    })
}

// Export socket handlers
module.exports = {
    setupSocketHandlers,
};

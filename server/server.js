const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const app = express()
app.use(cors())
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
})

// const { getClientsInRoom, generateRoom, move, calcFight } = require('./gameLogic');
const { getClientsInRoom, generateRoom, calcFight, move } = require('./gameLogic');

const roomMaps = {}
const roomTurns = {}
const roomColours = {}
const roomSelected = {}
const roomWinner = {}
const roomPhase = {}
const roomTroops = {}
const roomSize = {}

function getPossibleConnections(i, size) {
    let columnLeft = []
    let columnRight = []
    for (let i = 0; i < size - 2; i++) {
        columnLeft.push((i + 1) * size + 1)
        columnRight.push((i + 1) * size + size)
    }
    if (i == 1) {
        return [i + 1, i + size, i + size + 1]
    } else if (i == size) {
        return [i - 1, i + size, i + size - 1]
    } else if (Math.sqrt(i) == size) {
        return [i - 1, i - size, i - size - 1]
    } else if (i == (size - 1) * size + 1) {
        return [i + 1, i - size, i - size + 1]
    } else if (i < size) {
        return [i - 1, i + 1, i + size, i + size - 1, i + size + 1]
    } else if (columnLeft.includes(i)) {
        return [i - size, i + 1, i + size, i - size + 1, i + size + 1]
    } else if (columnRight.includes(i)) {
        return [i - size, i - 1, i + size, i - size - 1, i + size - 1]
    } else if (size * (size - 1) + 1 < i && i < size ** 2) {
        return [i - 1, i + 1, i - size + 1, i - size - 1, i - size]
    } else {
        return [
            i - 1,
            i + 1,
            i - size,
            i - size + 1,
            i - size - 1,
            i + size,
            i + size - 1,
            i + size + 1,
        ]
    }
}

io.on('connection', (socket) => {
    console.log(`${socket.id} connected`)
    socket.on('join_room', (room) => {
        let room_size = getClientsInRoom(io, room)
        if (room_size === 0) {
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
            io.to(room).emit('map', [roomMaps[room], roomSize[room]])
            socket.emit('map', [roomMaps[room], roomSize[room]])
            socket.emit('turn', roomTurns[room])
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
            io.to(room).emit('map', [roomMaps[room], roomSize[room]])
            socket.emit('map', [roomMaps[room], roomSize[room]])
            io.to(room).emit('turn', roomTurns[room])
            socket.emit('turn', roomTurns[room])
        } else {
            socket.emit('full')
        }
    })
    socket.on('endTurn', (data) => {
        if (data[0] == roomTurns[data[1]]) {
            if (roomTroops[data[1]] == 0) {
                for (let i = 0; i < roomMaps[data[1]].length; i++) {
                    if (data[0] == roomMaps[data[1]][i].color) {
                        roomTroops[data[1]] += 1
                    }
                }
            }
            move(-1, data[1], socket.id, roomMaps, roomPhase, roomTroops, roomSelected, roomColours, roomTurns)
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
    })
    socket.on('selected', (data) => {
        move(data[0], data[1], socket.id,  roomMaps, roomPhase, roomTroops, roomSelected, roomColours, roomTurns)
        emitAllData(data[1])
    })
    socket.on('leave_room', (room) => {
        socket.leave(room)
        console.log(`${socket.id} left ${room}`)
    })
    function emitAllData(room) {
        io.to(room).emit('map', [roomMaps[room], roomSize[room]])
        socket.emit('map', [roomMaps[room], roomSize[room]])
        io.to(room).emit('turn', roomTurns[room])
        socket.emit('turn', roomTurns[room])
        // io.to(room).emit('phase', roomPhase[room])
        // socket.emit('phase', roomPhase[room])
    }
})

server.listen(3001, () => {
    console.log('listening on *:3001')
})

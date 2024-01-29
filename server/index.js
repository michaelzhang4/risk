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

const roomMaps = {}
const roomTurns = {}
const roomColours = {}
const roomSelected = {}
const roomWinner = {}
const roomPhase = {}
const roomTroops = {}
const roomSize = {}

function getClientsInRoom(io, roomId) {
    const room = io.sockets.adapter.rooms.get(roomId)
    return room ? room.size : 0
}

function calcFight(node1, node2, room) {
    let num = Math.random()
    let diff = node1.units - node2.units
    if (node1.units < 2) {
        console.log('not enough to make a move')
    } else if (node2.color === 'neutral') {
        node2.units = node1.units - 1
        node1.units = 1
        node2.color = node1.color
    } else if (diff === 0) {
        if (num <= 0.5) {
            node1.units = 1
            node2.units = 1
        } else {
            node1.units = 1
            node2.units = 1
            node2.color = node1.color
        }
    } else if (diff === 1) {
        if (num <= 0.25) {
            node1.units = 1
            node2.units = 1
        } else {
            node1.units = 1
            node2.units = 1
            node2.color = node1.color
        }
    } else if (diff > 1) {
        node1.units = 1
        node2.units = diff
        node2.color = node1.color
    } else if (diff === -1) {
        if (num <= 0.75) {
            node1.units = 1
            node2.units = 1
        } else {
            node1.units = 1
            node2.units = 1
            node2.color = node1.color
        }
    } else if (diff < -1) {
        node2.units -= node1.units
        node1.units = 1
    }
}

function move(data, room, socket) {
    console.log(roomMaps[room])
    let clickedNode = roomMaps[room][data - 1]
    if (data == -1) {
        if (roomPhase[room] == 'attack') {
            roomPhase[room] = 'defend'
        } else if (roomPhase[room] == 'defend') {
            let i = 0
            while (roomTroops[room] > 0) {
                if (roomMaps[room][i].color == roomTurns[room]) {
                    roomMaps[room][i].units += 1

                    roomTroops[room] -= 1
                }
                i++
            }
            roomTurns[room] = roomTurns[room] == 'blue' ? 'red' : 'blue'
            roomPhase[room] = 'attack'
        }
    } else if (roomPhase[room] === 'attack') {
        if (roomColours[room] == socket && roomTurns[room] == 'blue') {
            if (clickedNode.color === 'blue') {
                roomSelected[room] = clickedNode
            } else if (
                roomSelected[room] &&
                roomSelected[room].color === 'blue'
            ) {
                if (roomSelected[room].connections.includes(clickedNode.id)) {
                    calcFight(roomSelected[room], clickedNode, room)
                    roomSelected[room] = null
                }
            }
        } else if (roomColours[room] != socket && roomTurns[room] == 'red') {
            if (clickedNode.color === 'red') {
                roomSelected[room] = clickedNode
            } else if (
                roomSelected[room] &&
                roomSelected[room].color === 'red'
            ) {
                if (roomSelected[room].connections.includes(clickedNode.id)) {
                    calcFight(roomSelected[room], clickedNode, room)
                    roomSelected[room] = null
                }
            }
        }
    } else if (roomPhase[room] == 'defend') {
        if (clickedNode.color == roomTurns[room] && roomTroops[room] > 0) {
            roomMaps[room][clickedNode.id - 1].units += 1
            roomTroops[room] -= 1
        }
        if (roomTroops[room] == 0) {
            roomTurns[room] = roomTurns[room] == 'blue' ? 'red' : 'blue'
            roomPhase[room] = 'attack'
        }
    }
}

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

function generateRoom() {
    map = []
    size = Math.floor(Math.random() * 3) + 3
    for (let i = 1; i <= size ** 2; i++) {
        let conns = getPossibleConnections(i, size)
        // console.log(Math.random())
        let rem = []
        for (let i = 0; i < conns.length; i++) {
            if (Math.random() > 0.75) {
                rem.push(conns[i])
            }
        }
        if(rem.length==0){
            rem.push(conns[Math.floor(Math.random()*conns.length)])
        }
        // console.log(rem)
        map.push({
            id: i,
            connections: rem,
            color: 'neutral',
            units: 0,
        })
    }
    for(let i=0;i<map.length;i++){
        for(let j=0;j<map[i].connections.length;j++){
            let connectedNode = map[i].connections[j]
            let currentNode = map[connectedNode-1]
            // console.log
            if(!currentNode.connections.includes(map[i].id)){
                map[connectedNode-1].connections.push(map[i].id)
            }
        }
    }
    map[0].color = 'blue'
    map[0].units = 2
    map[size ** 2 - 1].color = 'red'
    map[size ** 2 - 1].units = 3
    // console.log(map)
    return { map, size }
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
            // console.log(details)
            roomMaps[room] = details.map
            roomSize[room] = details.size
            // console.log(details.map)
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
    })
    socket.on('selected', (data) => {
        move(data[0], data[1], socket.id)
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

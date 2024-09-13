// gameLogic.js
function getClientsInRoom(io, roomId) {
    const room = io.sockets.adapter.rooms.get(roomId);
    return room ? room.size : 0;
}

function generateRoom() {
    let size = 3;
    let map = [];
    for (let i = 1; i <= size ** 2; i++) {
        let conns = getPossibleConnections(i, size);
        let rem = [];
        for (let j = 0; j < conns.length; j++) {
            if (Math.random() > 0.75) rem.push(conns[j]);
        }
        if (rem.length == 0) {
            rem.push(conns[Math.floor(Math.random() * conns.length)]);
        }
        map.push({
            id: i,
            connections: rem,
            color: 'neutral',
            units: 0,
        });
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
    map[0].color = 'blue';
    map[0].units = 2;
    map[size ** 2 - 1].color = 'red';
    map[size ** 2 - 1].units = 3;

    return { map, size };
}

function move(data, room, socket, roomMaps, roomPhase, roomTroops, roomSelected, roomColours, roomTurns) {
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

function getPossibleConnections(i, size) {
    let columnLeft = [];
    let columnRight = [];
    for (let i = 0; i < size - 2; i++) {
        columnLeft.push((i + 1) * size + 1);
        columnRight.push((i + 1) * size + size);
    }
    if (i == 1) {
        return [i + 1, i + size, i + size + 1];
    } else if (i == size) {
        return [i - 1, i + size, i + size - 1];
    } else if (Math.sqrt(i) == size) {
        return [i - 1, i - size, i - size - 1];
    } else if (i == (size - 1) * size + 1) {
        return [i + 1, i - size, i - size + 1];
    } else if (i < size) {
        return [i - 1, i + 1, i + size, i + size - 1, i + size + 1];
    } else if (columnLeft.includes(i)) {
        return [i - size, i + 1, i + size, i - size + 1, i + size + 1];
    } else if (columnRight.includes(i)) {
        return [i - size, i - 1, i + size, i - size - 1, i + size - 1];
    } else if (size * (size - 1) + 1 < i && i < size ** 2) {
        return [i - 1, i + 1, i - size + 1, i - size - 1, i - size];
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
        ];
    }
}

module.exports = {
    getClientsInRoom,
    generateRoom,
    move,
    calcFight,
};

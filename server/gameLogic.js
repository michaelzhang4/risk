

// Gets the number of clients in a room
function getClientsInRoom(io, roomId) {
    const room = io.sockets.adapter.rooms.get(roomId);
    return room ? room.size : 0;
}

// Randomly generates a grid with differing connections between nodes
function generateRoom() {
    let size = 3;
    let map = [];
    for (let i = 1; i <= size ** 2; i++) {
        // Get all possible connections from a node
        let conns = getPossibleConnections(i, size);
        let rem = [];
        // Check each possible connection from the node and randomly create or omit it
        for (let j = 0; j < conns.length; j++) {
            if (Math.random() > 0.75) rem.push(conns[j]);
        }
        // If no connection happen add at least one
        if (rem.length == 0) {
            rem.push(conns[Math.floor(Math.random() * conns.length)]);
        }
        // Add the node (with it's connections) to the map
        map.push({
            id: i,
            connections: rem,
            color: 'neutral',
            units: 0,
        });
    }

    // Adds all inverse connections so both nodes are bidirectional
    for(let i=0;i<map.length;i++){
        for(let j=0;j<map[i].connections.length;j++){
            let connectedNode = map[i].connections[j]
            let currentNode = map[connectedNode-1]
            if(!currentNode.connections.includes(map[i].id)){
                map[connectedNode-1].connections.push(map[i].id)
            }
        }
    }

    // Initialises blue and red starting nodes
    map[0].color = 'blue';
    map[0].units = 2;
    map[size ** 2 - 1].color = 'red';
    map[size ** 2 - 1].units = 3;

    // Returns the map and the map size
    return { map, size };
}

// Handles moves made by either player
function move(data, room, socket, roomMaps, roomPhase, roomTroops, roomSelected, roomColours, roomTurns) {
    let clickedNode = roomMaps[room][data - 1]

    // Change turn/phase when -1 flag is set
    if (data == -1) {
        // If was attacking, now change to rally state
        if (roomPhase[room] == 'attack') {
            roomPhase[room] = 'defend'
        // If was rallying, apply all rest of rally numbers and change to next player in attacking position
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
    // Otherwise process actions like friendly node selection and attacking enemy nodes
    } else if (roomPhase[room] === 'attack') {
        // Process blue turn
        if (roomTurns[room] == 'blue') {
            // Select blue node
            if (clickedNode.color === 'blue') {
                roomSelected[room] = clickedNode
            } else if (
                roomSelected[room] &&
                roomSelected[room].color === 'blue'
            ) {
                // Process attack
                if (roomSelected[room].connections.includes(clickedNode.id)) {
                    calcFight(roomSelected[room], clickedNode)
                    roomSelected[room] = null
                }
            }
        // Process red turn
        } else if (roomColours[room] != socket && roomTurns[room] == 'red') {
            // Select red node
            if (clickedNode.color === 'red') {
                roomSelected[room] = clickedNode
            } else if (
                roomSelected[room] &&
                roomSelected[room].color === 'red'
            ) {
                // Process attack
                if (roomSelected[room].connections.includes(clickedNode.id)) {
                    calcFight(roomSelected[room], clickedNode)
                    roomSelected[room] = null
                }
            }
        }
    // Increase node strength for current player rallying
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

// Calculate fight outcome
function calcFight(node1, node2) {
    let num = Math.random()
    let diff = node1.units - node2.units
    if (node1.units < 2) {
        console.log('not enough to make a move')
    // Anything > 1 automatically wins against neutral nodes
    } else if (node2.color === 'neutral') {
        node2.units = node1.units - 1
        node1.units = 1
        node2.color = node1.color
    // If same strengths for both nodes, give a 50% chance of drawing and a 50% change for attacker to win
    } else if (diff === 0) {
        if (num <= 0.5) {
            node1.units = 1
            node2.units = 1
        } else {
            node1.units = 1
            node2.units = 1
            node2.color = node1.color
        }
    // If 1 more strength then a 25% chance to draw and 75% for attacker to win
    } else if (diff === 1) {
        if (num <= 0.25) {
            node1.units = 1
            node2.units = 1
        } else {
            node1.units = 1
            node2.units = 1
            node2.color = node1.color
        }
    // > 2 difference means and automatic win
    } else if (diff > 1) {
        node1.units = 1
        node2.units = diff
        node2.color = node1.color
    // Attacker that is 1 weaker has a 25% chance to win and a 75% chance to draw
    } else if (diff === -1) {
        if (num <= 0.75) {
            node1.units = 1
            node2.units = 1
        } else {
            node1.units = 1
            node2.units = 1
            node2.color = node1.color
        }
    // Otherwise automatically lose but both sides lose amount of attacking node's strength (not below 1)
    } else if (diff < -1) {
        node2.units -= node1.units
        node1.units = 1
    }
}


// Returns all possible connections for a node index
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

// Export these functions
module.exports = {
    getClientsInRoom,
    generateRoom,
    move,
    calcFight,
};

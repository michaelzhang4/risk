import * as PIXI from 'pixi.js'

import createNode from './CreateNode'

let positions = [
    { x: 100, y: 300 },
    { x: 400, y: 300 },
    { x: 700, y: 300 },
    { x: 100, y: 600 },
    { x: 400, y: 600 },
    { x: 700, y: 600 },
    { x: 100, y: 900 },
    { x: 400, y: 900 },
    { x: 700, y: 900 },
]

function returnColour(color) {
    if (color === 'blue') {
        return '/images/blueNode.png'
    } else if (color === 'red') {
        return '/images/redNode.png'
    } else if (color === 'neutral') {
        return '/images/greyNode.png'
    }

    return null
}

function createMap(onClick, app, map, turn, player_id, onClick2) {
    const container = new PIXI.Container()

    app.stage.addChild(container)

    container.removeChildren()

    const text = new PIXI.Text(turn + ' players turn', {
        fontFamily: 'Arial',
        fontSize: 72,
        fill: 0xffffff, // White color, you can change as needed
        align: 'center',
    })

    text.x = 100
    text.y = 100
    container.addChild(text)

    const text1 = new PIXI.Text('You are ' + player_id, {
        fontFamily: 'Arial',
        fontSize: 72,
        fill: 0xffffff, // White color, you can change as needed
        align: 'center',
    })

    text1.x = 170
    text1.y = 20
    container.addChild(text1)
    const endTurn = PIXI.Sprite.from('/images/endTurn.png')
    endTurn.anchor.set(0.5)
    endTurn.x = 1000
    endTurn.y = 600
    endTurn.eventMode = 'dynamic' // Enable interaction
    endTurn.buttonMode = true // Show the pointer cursor
    endTurn.width = 200
    endTurn.height = 200
    endTurn.eventMode = 'static'
    endTurn.cursor = 'pointer'
    endTurn.on('pointerdown', () => onClick2())
    container.addChild(endTurn)

    let nodes = map[0]
    for (let i=0; i < nodes.length; i++) {
        let connections = nodes[i].connections 
        for (let j = 0; j < connections.length; j++) {
            let startx = positions[i].x
            
            let starty = positions[i].y
            
            let endx = positions[connections[j] - 1].x
            
            let endy = positions[connections[j] - 1].y
            
            let connection = new PIXI.Graphics()
            
            connection.lineStyle(6, '#000000', 1)
            
            connection.moveTo(startx, starty)
            
            connection.lineTo(endx, endy)
            
            container.addChild(connection)
        }
    }
    
    for (let i = 0; i < positions.length; i++) { 
        createNode(
            positions[i].x,

            positions[i].y,

            returnColour(nodes[i].color),

            onClick,

            container,

            nodes[i].units,

            nodes[i].id
        )
    }
}

export default createMap

import * as PIXI from 'pixi.js'

import createNode from './CreateNode'

let positions = [
    { x: 100, y: 300 },
    { x: 300, y: 300 },
    { x: 500, y: 300 },
    { x: 100, y: 500 },
    { x: 300, y: 500 },
    { x: 500, y: 500 },
    { x: 100, y: 700 },
    { x: 300, y: 700 },
    { x: 500, y: 700 },
]

function returnColour(color) {
    if (color === 'blue') {
        return '/images/blue_node.png'
    } else if (color === 'red') {
        return '/images/red_node.png'
    } else if (color === 'neutral') {
        return '/images/gray_node.png'
    }

    return null
}

function createMap(onClick, app, map, turn, player_id, onClick2, state) {

    const container = new PIXI.Container();

    app.stage.addChild(container)

    container.removeChildren()

    if (turn === player_id) {
        const text = new PIXI.Text('Your turn', {
            fontFamily: 'Arial',
            fontSize: 72,
            fill: 0xffffff,
            align: 'center',
        })
        
        text.x = 230
        text.y = 20
        container.addChild(text)
    } else {
        const text = new PIXI.Text('Enemy turn', {
            fontFamily: 'Arial',
            fontSize: 72,
            fill: 0xffffff,
            align: 'center',
        })
        
        text.x = 200
        text.y = 20
        container.addChild(text)
    }

    if(player_id === 'blue') {
        let connection = new PIXI.Graphics()
    
        connection.lineStyle(6, '#0096FF', 1);
        
        connection.moveTo(20, 20)
        
        connection.lineTo(800, 20)
        
        container.addChild(connection)
    
        connection.lineStyle(6, '#0096FF', 1);
        
        connection.moveTo(20, 200)
        
        connection.lineTo(800, 200)
        
        container.addChild(connection)

        connection.lineStyle(6, '#0096FF', 1);
        
        connection.moveTo(600, 400)
        
        connection.lineTo(800, 400)
        
        container.addChild(connection)
    
        connection.lineStyle(6, '#0096FF', 1);
        
        connection.moveTo(600, 600)
        
        connection.lineTo(800, 600)
        
        container.addChild(connection)

    } else if(player_id === 'red') {
        let connection = new PIXI.Graphics()
    
        connection.lineStyle(6, '#FF5733', 1);
        
        connection.moveTo(20, 20)
        
        connection.lineTo(800, 20)
        
        container.addChild(connection)
    
        connection.lineStyle(6, '#FF5733', 1);
        
        connection.moveTo(20, 200)
        
        connection.lineTo(800, 200)
        
        container.addChild(connection)

        connection.lineStyle(6, '#FF5733', 1);
        
        connection.moveTo(600, 400)
        
        connection.lineTo(800, 400)
        
        container.addChild(connection)
    
        connection.lineStyle(6, '#FF5733', 1);
        
        connection.moveTo(600, 600)
        
        connection.lineTo(800, 600)
        
        container.addChild(connection)
    }

    if(state==='attack') {
        const text1 = new PIXI.Text('Attack', {
            fontFamily: 'Arial',
            fontSize: 72,
            fill: 0xffffff, // White color, you can change as needed
            align: 'center',
        })
    
        text1.x = 300
        text1.y = 100
        container.addChild(text1)
    } else {
        const text1 = new PIXI.Text('Rally', {
            fontFamily: 'Arial',
            fontSize: 72,
            fill: 0xffffff, // White color, you can change as needed
            align: 'center',
        })
    
        text1.x = 300
        text1.y = 100
        container.addChild(text1)
    }
    
    
    const endTurn = PIXI.Sprite.from('/images/end_turn.png')
    endTurn.anchor.set(0.5)
    endTurn.x = 700
    endTurn.y = 500
    endTurn.eventMode = 'dynamic' // Enable interaction
    endTurn.buttonMode = true // Show the pointer cursor
    endTurn.width = 300
    endTurn.height = 300
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

            connection.lineStyle(6, '#899499', 1);
            
            connection.moveTo(startx, starty)
            
            connection.lineTo(endx, endy)
            
            container.addChild(connection)
        }
    }

    for (let i=0; i < nodes.length; i++) {
        let connections = nodes[i].connections 
        for (let j = 0; j < connections.length; j++) {
            if(nodes[i].color === 'grey') {

            }
            else if (nodes[i].color === 'blue') {
                if (nodes[connections[j] - 1].color === 'red') {

                    let startx = positions[i].x
                    
                    let starty = positions[i].y
                
                    let endx = positions[connections[j] - 1].x
                    
                    let endy = positions[connections[j] - 1].y
                    
                    let connection = new PIXI.Graphics()
                    
                    connection.lineStyle(6, '#5D3FD3', 1)
                    
                    connection.moveTo(startx, starty)
                    
                    connection.lineTo(endx, endy)
                    
                    container.addChild(connection)
                } else {
                    let startx = positions[i].x
            
                    let starty = positions[i].y
                    
                    let endx = positions[connections[j] - 1].x
                    
                    let endy = positions[connections[j] - 1].y
                    
                    let connection = new PIXI.Graphics()
                    
                    connection.lineStyle(6, '#0096FF', 1)
                    
                    connection.moveTo(startx, starty)
                    
                    connection.lineTo(endx, endy)
                    
                    container.addChild(connection)
                }
            }
            else if(nodes[i].color === 'red') {
                if (nodes[connections[j] - 1].color === 'blue') {
                    let startx = positions[i].x
                    
                    let starty = positions[i].y
                
                    let endx = positions[connections[j] - 1].x
                    
                    let endy = positions[connections[j] - 1].y
                    
                    let connection = new PIXI.Graphics()
                    
                    connection.lineStyle(6, '#5D3FD3', 1)
                    
                    connection.moveTo(startx, starty)
                    
                    connection.lineTo(endx, endy)
                    
                    container.addChild(connection)
                } else {
                    let startx = positions[i].x
                
                    let starty = positions[i].y
                    
                    let endx = positions[connections[j] - 1].x
                    
                    let endy = positions[connections[j] - 1].y
                    
                    let connection = new PIXI.Graphics()
                    
                        connection.lineStyle(6, '#FF5733', 1)
                    
                    connection.moveTo(startx, starty)
                    
                    connection.lineTo(endx, endy)
                    
                    container.addChild(connection)
                }
            }
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

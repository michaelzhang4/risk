import * as PIXI from 'pixi.js'

// Creates node
function createNode(x, y, imagePath, onClick, app, units,id) {
    const node = PIXI.Sprite.from(imagePath)
    node.anchor.set(0.5)
    node.x = x
    node.y = y
    node.eventMode = 'dynamic' // Enable interaction 
    node.buttonMode = true // Show the pointer cursor
    node.width = 200
    node.height = 200
    node.eventMode = 'static'
    node.cursor = 'pointer'
    node.id = id
    node.on('pointerdown', () => onClick(node)) // Callback function returned on node click

    // Create a text object for the number
    const text = new PIXI.Text(units.toString(), {
        fontFamily: 'Arial',
        fontSize: 72,
        fill: 0xffffff,
        align: 'center'
    });

    // Position the text on the sprite (centering it on the sprite)
    text.x = x-20;
    text.y = y-35;

    // Add node and text to the application
    app.addChild(node)
    app.addChild(text)
    return node
}
export default createNode

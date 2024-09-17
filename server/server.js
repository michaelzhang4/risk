const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const app = express()
app.use(cors())
const server = http.createServer(app)

// Create server on localhost:3000
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
})

// Set up sockets
const { setupSocketHandlers } = require('./socketHandlers.js');
setupSocketHandlers(io)

// Listen on port 3001
server.listen(3001, () => {
    console.log('listening on *:3001')
})

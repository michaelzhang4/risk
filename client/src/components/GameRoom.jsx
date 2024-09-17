import React from 'react'
import createMap from '../CreateMap'
import { useRef, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import * as PIXI from 'pixi.js'
import io from 'socket.io-client'

// Game component
function GameRoom() {
    // Room value from url
    const { room } = useParams()
    const [roomName, setRoomName] = useState(room.substring(5, room.length))
    const gameCanvasRef = useRef(null)
    const [error, setError] = useState(true)
    // State of board/map
    const [map, setMap] = useState([])
    // Player's colour
    const [player, setPlayer] = useState('')
    // State to store the winner
    const [winner, setWinner] = useState(null);
    // Player's turn
    const [turn, setTurn] = useState('')
    // Attack/Rally state of current player's turn
    const [state, setState] = useState('')
    // Reference to communication socket
    const socketRef = useRef(null)
    // Reference to PIXI application
    const appRef = useRef(null)

    // Socket events to change state
    useEffect(() => {
        socketRef.current = io('http://localhost:3001')
        const socket = socketRef.current
        // On socket connection join the room with the given room value
        socket.on('connect', () => {
            setError(false)
            socket.emit('join_room', roomName)
        })
        // Receive changes in player colour
        socket.on('player_id', (data) => {
            setPlayer(data)
        })
        // Receive changes in the game map
        socket.on('map', (data) => {
            setMap(data)
        })
        // Receive changes in the player turn
        socket.on('turn', (data) => {
            setTurn(data)
        })
        // Receive changes in the stage of each player's turn (Rally/Attack)
        socket.on('state', (data) => {
            setState(data)
        })
        // Receive winner announcement
        socket.on('winner', (data) => {
            setWinner(data);
        });
        // Error checks
        socket.on('connect_error', (err) => {
            setError(true)
        })

        socket.on('error', (err) => {
            setError(true)
        })

        // If room is occupied by two players already throw an error
        socket.on('full', () => {
            setError(true)
        })
        // When unmounting cleanup
        return () => {
            // Call leave room
            socket.emit('leave_room', room.substring(5, room.length))
            // Clean up all event listeners
            socket.off('player_id');
            socket.off('map');
            socket.off('turn');
            socket.off('state');
            socket.off('winner');
            socket.off('connect_error');
            socket.off('error');
            socket.off('full');
            // Disconnect socket
            socket.disconnect()
        }
    }, [])

    // On click functions for end turn button and nodes
    useEffect(() => {
        if (error) {
            return
        }

        // End turn on click
        function onClick2() {
            socketRef.current.emit('endTurn', [player, roomName])
        }

        // Node click
        function onClick(sprite) {
            socketRef.current.emit('selected', [sprite.id, roomName])
        }

        // Create a new PIXI application if not already existing
        if (!appRef.current) {
            appRef.current = new PIXI.Application({
                background: '#030350',
                resizeTo: window,
                clearBeforeRender: true
            })
            if (gameCanvasRef.current) {
                gameCanvasRef.current.appendChild(appRef.current.view)
            }
        }

        // Remove previous renders and rerender the current reference to the PIXI application
        const app = appRef.current
        app.stage.removeChildren()
        app.renderer.render(app.stage) 

        // Recreate map render from states
        createMap(onClick, app, map, turn, player, onClick2, state, winner)

        return () => {
        }
        // Call useeffect when map or turn or state changes
    }, [map,turn,state,winner])

    // Clean up PIXI application and reference
    useEffect(() => {
        return () => {
            if (appRef.current) {
                appRef.current.destroy(true, true)
                appRef.current = null
            }
        }
    }, [])

    // Display gameCanvas
    return (
        <div section="main">
            {!error && <div ref={gameCanvasRef} id="game-canvas"></div>}
            {error && <h1>666 Server Not Responding</h1>}
        </div>
    )
}

export default GameRoom

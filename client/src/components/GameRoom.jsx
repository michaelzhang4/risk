import React from 'react'
import '../App.css'
import createNode from '../CreateNode'
import createMap from '../CreateMap'
import { useRef, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import * as PIXI from 'pixi.js'
import io from 'socket.io-client'


function GameRoom() {
    const { room } = useParams()
    const gameCanvasRef = useRef(null)
    const [map, setMap] = useState([])
    const [error, setError] = useState(true)
    const [player, setPlayer] = useState('')
    const [turn, setTurn] = useState('')
    const socketRef = useRef(null);
    useEffect(() => {
        socketRef.current = io('http://localhost:3001')
        const socket=socketRef.current;
        socket.on('connect', () => {
            setError(false)
            socket.emit('join_room', room.substring(5, room.length))
        })

        socket.on('player_id', (data) => {
            setPlayer(data)
        })

        socket.on('map', (data) => {
            setMap(data)
        })

        socket.on('turn',(data) => {
            setTurn(data)
        })

        socket.on('connect_error', (err) => {
            setError(true)
        })

        socket.on('error', (err) => {
            setError(true)
        })

        socket.on('full', () => {
            setError(true)
        })
        return () => {
            socket.emit('leave_room', room.substring(5, room.length))
            socket.off('map')
            socket.disconnect()
        }
    }, [])

    useEffect(() => {
        if (error) {
            return
        }
        const app = new PIXI.Application({
            background: '#1099bb',
            resizeTo: window,

        })
        function onClick(sprite) {
            socketRef.current.emit('selected',sprite.id)
        }

        gameCanvasRef.current.appendChild(app.view)
        createMap(onClick, app, map, turn, player)

        return () => {
            // gameCanvasRef.current.removeChild(app.view)
            if (app && app.destroy) {
                app.destroy(true, true)
            }
        }
    }, [map])
    return (
        <div ref={gameCanvasRef} section="main">
            {!error && <div ref={gameCanvasRef} id="game-canvas"></div>}
            {error && <h1>666 Server Not Responding</h1>}
        </div>
    )
}

export default GameRoom

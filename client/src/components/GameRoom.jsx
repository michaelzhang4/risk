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
    const [state, setState] = useState('')
    const [roomName, setRoomName] = useState(room.substring(5, room.length))
    const socketRef = useRef(null)
    const appRef = useRef(null)

    useEffect(() => {
        socketRef.current = io('http://localhost:3001')
        const socket = socketRef.current
        socket.on('connect', () => {
            setError(false)
            socket.emit('join_room', roomName)
        })

        socket.on('player_id', (data) => {
            setPlayer(data)
        })

        socket.on('map', (data) => {
            setMap(data)
        })

        socket.on('turn', (data) => {
            setTurn(data)
        })

        socket.on('state', (data) => {
            setState(data)
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

        function onClick2() {
            socketRef.current.emit('endTurn', [player, roomName])
        }

        function onClick(sprite) {
            socketRef.current.emit('selected', [sprite.id, roomName])
        }

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

        const app = appRef.current

        app.stage.removeChildren()

        app.renderer.render(app.stage) 

        createMap(onClick, app, map, turn, player, onClick2, state)

        return () => {
        }
    }, [map,turn,state])


    useEffect(() => {
        return () => {
            if (appRef.current) {
                appRef.current.destroy(true, true)
                appRef.current = null
            }
        }
    }, [])

    return (
        <div section="main">
            {!error && <div ref={gameCanvasRef} id="game-canvas"></div>}
            {error && <h1>666 Server Not Responding</h1>}
        </div>
    )
}

export default GameRoom

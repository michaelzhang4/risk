import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';

// Home Page
const HomePage = () => {
    // Room name state
    const [room, setRoom] = useState('')
    // Navigate around website
    const nav = useNavigate()
    // Join current room
    const join_room = () => {
        nav(`/game/room=${room}`)
    }
    return (
        // Room name input button
        <div>
            <input
                placeholder="Enter a room"
                onChange={(e) => {
                    setRoom(e.target.value)
                }}
            ></input>
            <button onClick={() => join_room()}>Join Room</button>
        </div>
    );
};

export default HomePage;

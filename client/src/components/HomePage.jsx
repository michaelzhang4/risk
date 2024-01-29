import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';

const HomePage = () => {
    const [room, setRoom] = useState('')
    const nav = useNavigate()

    const join_room = () => {
        nav(`/game/room=${room}`)
    }
    return (
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

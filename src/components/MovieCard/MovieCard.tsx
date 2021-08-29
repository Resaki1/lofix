import React from "react"
import Popup from "../Popup/Popup"
import "./MovieCard.css"

export default function MovieCard(props: any) {
    const [showPopup, setShowPopup] = React.useState(false)
    const movie = props.movie
    return (
        <div className="movieCard" key={movie.id}>
            {movie.poster && <img src={URL.createObjectURL(movie.poster)} onClick={() => setShowPopup(movie.name)} alt={movie.name} />}
            {showPopup === movie.name && <Popup movie={movie} close={() => setShowPopup(false)} />}
        </div>
    )
}
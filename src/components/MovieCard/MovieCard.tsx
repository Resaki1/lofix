import React from "react";
import { Movie } from "../../types/types";
import Popup from "../Popup/Popup";
import "./MovieCard.css";

type MovieCardProps = {
  movie: Movie;
};

export default function MovieCard(props: MovieCardProps) {
  const [showPopup, setShowPopup] = React.useState<false | string>(false);
  const movie = props.movie;
  return (
    <>
      <div
        onClick={
          showPopup === false ? () => setShowPopup(movie.name) : undefined
        }
        className="movieCard"
        key={movie.id}
      >
        {movie.poster ? (
          <img src={URL.createObjectURL(movie.poster)} alt={movie.name} />
        ) : (
          <div>{movie.name}</div>
        )}
      </div>
      {showPopup === movie.name && (
        <Popup movie={movie} close={() => setShowPopup(false)} />
      )}
    </>
  );
}

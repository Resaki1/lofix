import { get } from "idb-keyval";
import { useEffect, useState } from "react";
import { Movie } from "../../types/types";
import Popup from "../Popup/Popup";
import "./MovieCard.scss";

type MovieCardProps = {
  movie: Partial<Movie>;
};

export default function MovieCard({ movie }: MovieCardProps) {
  const [showPopup, setShowPopup] = useState<false | string>(false);
  const [values, setValues] = useState<{
    poster?: string;
    backdrop?: string;
    fileHandle: FileSystemFileHandle | null;
  }>({ poster: "", backdrop: "", fileHandle: null });

  useEffect(() => {
    // TODO: Show if file is not available
    if (movie.id) {
      get(movie.id).then((value) => {
        setValues({
          poster: URL.createObjectURL(value.poster),
          backdrop: URL.createObjectURL(value.backdrop),
          fileHandle: value.fileHandle,
        });
      });
    } else if (movie.name) {
      get(movie.name).then((value) => {
        setValues({
          fileHandle: value.fileHandle,
        });
      });
    }
  }, [movie.id, movie.name]);

  return (
    <>
      <div
        onClick={
          showPopup === false ? () => setShowPopup(movie.name!) : undefined
        }
        className="movieCard"
        key={movie.id}
      >
        {values.poster ? (
          <img src={values.poster} alt={movie.name} />
        ) : (
          <div className="emptyMovieCard">{movie.name}</div>
        )}
      </div>
      {showPopup === movie.name && (
        <Popup
          movie={movie}
          backdrop={values.backdrop}
          fileHandle={values.fileHandle}
          close={() => setShowPopup(false)}
        />
      )}
    </>
  );
}

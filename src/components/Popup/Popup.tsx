import { update } from "idb-keyval";
import { useEffect, useState } from "react";
import { X } from "react-feather";
import ReactPlayer from "react-player";
import { getDetails, getImage } from "../../api/api";
import { useMovieStore } from "../../store/store";
import { Movie } from "../../types/types";
import "./Popup.scss";

type PopupProps = {
  movie: Partial<Movie>;
  backdrop?: string;
  fileHandle: FileSystemFileHandle | null;
  close: () => void;
};

async function verifyPermission(fileHandle: FileSystemFileHandle) {
  let opts = {};
  // Check if permission was already granted. If so, return true.
  if ((await fileHandle.queryPermission(opts)) === "granted") {
    return true;
  }
  // Request permission. If the user grants permission, return true.
  if ((await fileHandle.requestPermission(opts)) === "granted") {
    return true;
  }
  // The user didn't grant permission, so return false.
  return false;
}

export default function Popup({
  movie,
  backdrop,
  fileHandle,
  close,
}: PopupProps) {
  const [file, setFile] = useState<File>();
  const [index, setIndex] = useState<any>(0);

  const changeMovie = useMovieStore((state) => state.changeMovie);

  useEffect(() => {
    // TODO: handle file not found
    if (fileHandle) {
      verifyPermission(fileHandle).then((accessAllowed) => {
        if (accessAllowed) {
          fileHandle?.getFile().then((file: File) => setFile(file));
        }
      });
    }
  }, [fileHandle]);

  let newMovie: any;
  const handleChangeMovie = async () => {
    newMovie = movie.alternatives![index];
    const poster = await getImage(newMovie.poster_path, 300);
    const backdrop = await getImage(newMovie.backdrop_path, 1280);

    update(newMovie.id, () => ({ poster, backdrop, fileHandle }));
    const newMovieDetails = await getDetails(
      movie.alternatives![index].media_type,
      movie.alternatives![index].id
    );
    changeMovie(movie.id!, newMovieDetails);
  };

  return (
    <div className="popup">
      <div className="popupBackdrop" onClick={close} />
      <div className="popupContent">
        {file && (
          <ReactPlayer
            width="100%"
            controls
            light={backdrop}
            playing
            url={URL.createObjectURL(file)}
          />
        )}
        <h2>{movie.name}</h2>
        <div className="movieDetails">
          <p className="movieOverview">{movie.overview}</p>
          <div className="movieProperties">
            {movie.duration && (
              <span>Länge: {Math.round(movie.duration / 60)} Minuten</span>
            )}
            {movie.date && <span>Jahr: {movie.date}</span>}
            {movie.rating && (
              <span>
                Bewertung:{" "}
                {movie.rating > 0
                  ? Math.round(movie.rating * 10) / 10 + " / 10"
                  : "-"}
              </span>
            )}
            {movie.genres && (
              <span>
                Genres:{" "}
                <ol className="genres">
                  <br />
                  {movie.genres.map((genre) => (
                    <li key={genre.id}>{genre.name}</li>
                  ))}
                </ol>
              </span>
            )}
            {/* TODO: add remove button */}
          </div>
        </div>
        <div className="changeMovieWrapper">
          <h3>Falscher Film?</h3>
          {movie.alternatives && (
            <>
              <p>Wähle hier eine Alternative aus:</p>
              <div className="altMoviesWrapper">
                <select onChange={(e) => setIndex(e.target.value)}>
                  {movie.alternatives.map((alternative, i) => (
                    <option
                      key={i}
                      value={i}
                      disabled={
                        i ===
                        movie.alternatives?.findIndex((m) => m.id === movie.id)
                      }
                    >
                      {alternative.media_type === "movie"
                        ? alternative.title +
                          " - " +
                          alternative.release_date?.split("-")[0] +
                          " (Film)"
                        : alternative.name +
                          " - " +
                          alternative.first_air_date?.split("-")[0] +
                          " (Serie)"}
                    </option>
                  ))}
                </select>
                <button
                  disabled={
                    index ===
                    movie.alternatives?.findIndex((m) => m.id === movie.id)
                  }
                  onClick={handleChangeMovie}
                >
                  ändern
                </button>
              </div>
            </>
          )}
        </div>
        <button onClick={close} className="closeButton">
          <X />
        </button>
      </div>
    </div>
  );
}

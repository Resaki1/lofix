import { useEffect, useState } from "react";
import { X } from "react-feather";
import ReactPlayer from "react-player";
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

  useEffect(() => {
    if (fileHandle) {
      verifyPermission(fileHandle).then((accessAllowed) => {
        if (accessAllowed) {
          fileHandle?.getFile().then((file: File) => setFile(file));
        }
      });
    }
  }, [fileHandle]);

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
          </div>
        </div>
        <button onClick={close} className="closeButton">
          <X />
        </button>
      </div>
    </div>
  );
}

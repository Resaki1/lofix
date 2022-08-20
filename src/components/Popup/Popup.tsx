import { useEffect, useState } from "react";
import { X } from "react-feather";
import ReactPlayer from "react-player";
import { Movie } from "../../types/types";
import "./Popup.scss";

type PopupProps = {
  movie: Movie;
  backdrop: string;
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

export default function Popup(props: PopupProps) {
  const [file, setFile] = useState<File>();

  useEffect(() => {
    if (props.fileHandle) {
      verifyPermission(props.fileHandle).then((accessAllowed) => {
        if (accessAllowed) {
          props.fileHandle?.getFile().then((file: File) => setFile(file));
        }
      });
    }
  }, [props.fileHandle]);

  return (
    <div className="popup">
      <div className="popupBackdrop" onClick={props.close} />
      <div className="popupContent">
        {file && (
          <ReactPlayer
            width="100%"
            controls
            light={props.backdrop}
            playing
            url={URL.createObjectURL(file)}
          />
        )}
        <h2>{props.movie.name}</h2>
        <div className="movieDetails">
          <p className="movieOverview">{props.movie.overview}</p>
          <div className="movieProperties">
            <span>Länge: {Math.round(props.movie.duration / 60)} Minuten</span>
            <span>Jahr: {props.movie.date}</span>
            <span>
              Bewertung:{" "}
              {props.movie.rating > 0
                ? Math.round(props.movie.rating * 10) / 10 + " / 10"
                : "-"}
            </span>
            <span>
              Genres:{" "}
              <ol className="genres">
                <br />
                {props.movie.genres.map((genre) => (
                  <li key={genre.id}>{genre.name}</li>
                ))}
              </ol>
            </span>
          </div>
        </div>
        <button onClick={props.close} className="closeButton">
          <X />
        </button>
      </div>
    </div>
  );
}

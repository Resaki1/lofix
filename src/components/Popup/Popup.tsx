import React from "react";
import { X } from "react-feather";
import ReactPlayer from "react-player";
import { Movie } from "../../types/types";
import "./Popup.scss";

type PopupProps = {
  movie: Movie;
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
  const [file, setFile] = React.useState<File>();

  React.useEffect(() => {
    console.log(props.movie);
    verifyPermission(props.movie.fileHandle).then((accessAllowed) => {
      if (accessAllowed) {
        props.movie.fileHandle.getFile().then((file: File) => setFile(file));
      }
    });
  }, [props.movie.fileHandle]);

  return (
    <div className="popup">
      <div className="popupBackdrop" onClick={props.close} />
      <div className="popupContent">
        {file && (
          <ReactPlayer
            width="100%"
            controls
            light={
              props.movie.backdrop
                ? URL.createObjectURL(props.movie.backdrop)
                : undefined
            }
            playing
            url={URL.createObjectURL(file)}
          />
        )}
        <h2>{props.movie.name}</h2>
        <button onClick={props.close} className="closeButton">
          <X />
        </button>
      </div>
    </div>
  );
}

import { values, update } from "idb-keyval";
import { Dispatch, SetStateAction } from "react";
import { getMovieDetails, getImage } from "../api/api";
import { Movie } from "../types/types";

export const mapDirectoryToMovies = async (
  dirHandle: FileSystemDirectoryHandle,
  setMoviesState: Dispatch<SetStateAction<Movie[] | undefined>>
) => {
  for await (const fileHandle of dirHandle.values()) {
    mapFileToMovie(fileHandle, setMoviesState);
  }
};

export const mapFileToMovie = async (
  fileHandle: FileSystemHandle,
  setMoviesState: Dispatch<SetStateAction<Movie[] | undefined>>
): Promise<void> => {
  // check if entry is a video file
  // TODO: recursively also include subfolders
  if (fileHandle.kind === "file") {
    const file = await fileHandle.getFile();

    if (file.type === "video/mp4") {
      // get video duration
      let duration = 0;
      let video = document.createElement("video");
      video.setAttribute("src", window.URL.createObjectURL(file));

      video.onloadeddata = async function (): Promise<void> {
        duration = video.duration;
        // TODO: check if movie has been set twice in one go
        const searchResult = await getMovieDetails(fileHandle.name, duration);
        if (searchResult) {
          console.log(fileHandle.name + " -> " + searchResult.original_title);

          const movie: Movie = {
            id: searchResult.id,
            name: searchResult.title,
            // TODO: look for images if no path is given
            poster: await getImage(searchResult.poster_path),
            backdrop: await getImage(searchResult.backdrop_path),
            fileHandle: fileHandle,
          };

          update(movie.id, () => movie).then(() =>
            values().then((values) => setMoviesState(values))
          );
        }
      };
    }
  }
};

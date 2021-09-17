import { values, update } from "idb-keyval";
import { Dispatch, SetStateAction } from "react";
import { getImage, searchByName, getDetails } from "../api/api";
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
    fileHandle.getFile().then((file) => {
      if (file.type === "video/mp4") {
        // get video duration
        let duration = 0;
        let video = document.createElement("video");
        video.setAttribute("src", window.URL.createObjectURL(file));

        video.onloadeddata = async function (): Promise<void> {
          duration = video.duration;
          const fileName = fileHandle.name.split(".").slice(0, -1).join(".");
          // TODO: check if movie has been set twice in one go

          searchByName(fileName).then(async (searchResults) => {
            console.log(searchResults);
            if (searchResults.length === 0)
              console.log(`${fileName}: no match found`);
            // TODO: take collections into consideration
            // TODO: chain queries: https://developers.themoviedb.org/3/getting-started/append-to-response
            let currentBestMovie: any;
            let currentBestRuntime: number;
            let exactMatchFound = false;

            await Promise.all(
              searchResults.map(async (movie: any) => {
                if (exactMatchFound) return;

                // return details if file name is exact match
                // TODO: first sort movies by popularity to improve results
                if (
                  fileName.normalize().toLowerCase() ===
                    movie.original_title.normalize().toLowerCase() ||
                  fileName.normalize().toLowerCase() ===
                    movie.title.normalize().toLowerCase()
                ) {
                  console.log(
                    "exact match found: " +
                      fileName +
                      " == " +
                      movie.original_title
                  );

                  exactMatchFound = true;
                  await getDetails(movie.media_type, movie.id).then(
                    (result) => {
                      currentBestMovie = result;
                    }
                  );
                } else {
                  await getDetails(movie.media_type, movie.id).then(
                    (result) => {
                      const runtimeDeviation = duration / 60 / result.runtime;
                      if (
                        !currentBestMovie ||
                        Math.abs(runtimeDeviation - 1) < currentBestRuntime
                      ) {
                        currentBestRuntime = Math.abs(runtimeDeviation - 1);
                        currentBestMovie = movie;
                      }
                    }
                  );
                }
              })
            );

            if (currentBestMovie) {
              console.log(
                fileHandle.name + " -> " + currentBestMovie.original_title
              );

              const movie: Movie = {
                id: currentBestMovie.id,
                name: currentBestMovie.title,
                // TODO: look for images if no path is given
                poster: await getImage(currentBestMovie.poster_path),
                backdrop: await getImage(currentBestMovie.backdrop_path),
                fileHandle: fileHandle,
              };

              update(movie.id, () => movie).then(() =>
                values().then((values) => setMoviesState(values))
              );
            }
          });
        };
      }
    });
  }
};

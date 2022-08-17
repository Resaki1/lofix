import { values, update, get, set } from "idb-keyval";
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
  fileHandle: FileSystemFileHandle | FileSystemDirectoryHandle,
  setMoviesState: Dispatch<SetStateAction<Movie[] | undefined>>
): Promise<void> => {
  // check if entry is a video file
  // TODO: recursively also include subfolders
  if (fileHandle.kind === "file") {
    fileHandle.getFile().then((file: any) => {
      if (/* file.type === "video/mp4" */ true) {
        // get video duration
        let duration = 0;
        let video = document.createElement("video");
        video.setAttribute("src", window.URL.createObjectURL(file));

        video.onloadeddata = async function (): Promise<void> {
          duration = video.duration;
          const fileName = fileHandle.name.split(".").slice(0, -1).join(".");
          // TODO: check if movie has been set twice in one go

          const searchForMovie = async (nameToSearch: string) => {
            searchByName(nameToSearch).then(async (searchResults) => {
              if (!searchResults) {
                return alert("No results found for " + nameToSearch);
              }

              if (searchResults.length === 0) {
                const newName = nameToSearch.split(" ").slice(0, -1).join(" ");
                if (!newName) return alert("No results found for " + fileName);
                searchForMovie(newName);
              }
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
                  const original_title =
                    movie.media_type === "movie"
                      ? movie.original_title
                      : movie.original_name;
                  if (
                    nameToSearch.normalize().toLowerCase() ===
                      original_title.normalize().toLowerCase() ||
                    nameToSearch.normalize().toLowerCase() ===
                      movie.title?.normalize().toLowerCase()
                  ) {
                    console.log(
                      "exact match found: " +
                        nameToSearch +
                        " == " +
                        original_title
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
                const movie: Movie = {
                  id: currentBestMovie.id,
                  name: currentBestMovie.title
                    ? currentBestMovie.title
                    : currentBestMovie.name,
                  // TODO: look for images if no path is given
                  poster: await getImage(currentBestMovie.poster_path),
                  backdrop: await getImage(currentBestMovie.backdrop_path),
                  fileHandle: fileHandle,
                };

                get(movie.name).then(async (collection) => {
                  // check if entry with this name exists in database
                  if (!collection) {
                    // name is not yet in database -> add
                    const newCollection = {
                      id: movie.id,
                      name: movie.name,
                      poster: movie.poster,
                      parts: [movie],
                      fileHandle: fileHandle,
                    };
                    update(newCollection.name, () => newCollection).then(
                      async () =>
                        values().then((values) => setMoviesState(values))
                    );
                  }
                  // name is already in database -> check if current file is already in database
                  else if (
                    collection.parts.filter(
                      (part: Movie) =>
                        part.fileHandle.name === movie.fileHandle.name
                    ).length === 0
                  ) {
                    console.log(
                      `adding ${movie.fileHandle.name} to ${collection.name}`
                    );
                    // file is not part of existing collection -> add do collection
                    const updatedCollection = collection;
                    updatedCollection.parts.push(movie);
                    update(collection.name, () => updatedCollection).then(
                      async () =>
                        values().then((values) => {
                          console.log(values);
                          setMoviesState(values);
                        })
                    );
                  } else {
                    // file is already part of existing collection -> update details
                    console.log(`updating ${movie.fileHandle.name}`);
                  }
                });
              }
            });
          };
          searchForMovie(fileName);
        };
      }
    });
  }
};

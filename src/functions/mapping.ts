import { set } from "idb-keyval";
import { getImage, searchByName, getDetails } from "../api/api";
import { Movie } from "../types/types";

export const mapDirectoryToMovies = async (
  dirHandle: FileSystemDirectoryHandle,
  addMovie: (movie: Movie) => void,
  addUnmappedMovie: (movie: string) => void
) => {
  for await (const fileHandle of dirHandle.values()) {
    getMovieFromFile(fileHandle, addMovie, addUnmappedMovie);
  }
};

export const getMovieFromFile = async (
  fileHandle: FileSystemFileHandle | FileSystemDirectoryHandle,
  addMovie: (movie: Movie) => void,
  addUnmappedMovie: (movie: string) => void
) => {
  if (fileHandle.kind === "file") {
    const file = await fileHandle.getFile();

    // get duration
    let duration = 0;
    let video = document.createElement("video");
    video.setAttribute("src", window.URL.createObjectURL(file));

    video.onloadeddata = async function (): Promise<void> {
      duration = video.duration;
      video.remove();

      // search for movie by name
      const fileName = file.name.split(".")[0];
      const movies = await getMoviesByName(fileName);

      // no results found
      if (movies?.length === 0) {
        addUnmappedMovie(fileName);
        set(fileName, { fileHandle });
      }

      // one result found
      if (movies?.length === 1) {
        const movie = movies[0];

        // TODO: chain API calls
        const details = await getDetails(movie.media_type, movie.id);
        const poster = await getImage(details.poster_path);
        const backdrop = await getImage(details.backdrop_path);
        console.log(fileName + " -> " + movie.name + " (only result)");

        set(movie.id, { poster, backdrop, fileHandle });
        return addMovie({
          id: movie.id,
          name: movie.title ?? movie.name,
          duration,
          date:
            movie.release_date?.split("-")[0] ??
            movie.first_air_date?.split("-")[0],
          genres: details.genres,
          overview: details.overview,
          rating: movie.vote_average,
          fileHandle,
        });
      }

      // multiple results found
      let movie;
      if (movies && movies.length > 1) {
        movie = await getBestResult(fileName, duration, movies);

        // TODO: chain API calls
        const details = await getDetails(movie.media_type, movie.id);
        const poster = await getImage(details.poster_path);
        const backdrop = await getImage(details.backdrop_path);

        set(movie.id, { poster, backdrop, fileHandle });
        return addMovie({
          id: movie.id,
          name: movie.title ?? movie.name,
          duration,
          date:
            movie.release_date?.split("-")[0] ??
            movie.first_air_date?.split("-")[0],
          genres: details.genres,
          overview: details.overview,
          rating: movie.vote_average,
          fileHandle,
          alternatives: movies,
        });
      }
    };
  }
};

const getMoviesByName = async (nameToSearch: string) => {
  const movies = await searchByName(nameToSearch);

  if (movies.length === 0) {
    const newName = nameToSearch.split(" ").slice(0, -1).join(" ");
    if (!newName) return alert("No results found for " + movies);
    getMoviesByName(newName);
  }

  return movies;
};

const getBestResult = async (
  name: string,
  duration: number,
  movies: any[]
): Promise<any> => {
  // check if there is a perfect match
  let movie = movies.find(
    (movie) =>
      movie.title?.normalize().toLowerCase() ===
        name.normalize().toLowerCase() ||
      movie.name?.normalize().toLowerCase() === name.normalize().toLowerCase()
  );

  if (movie) {
    console.log(name + " -> " + (movie.name ?? movie.title) + " (exact match)");
    return movie;
  }

  // check if there is a match with the original title
  movie = movies.find(
    (movie) =>
      movie.original_title?.normalize().toLowerCase() ===
        name.normalize().toLowerCase() ||
      movie.original_name?.normalize().toLowerCase() ===
        name.normalize().toLowerCase()
  );

  if (movie) {
    console.log(
      name +
        " -> " +
        (movie.original_name ?? movie.original_title) +
        " (exact match, original title)"
    );
    return movie;
  }

  // check for (close) runtime match
  movie = movies.find(async (movie) => {
    const details = await getDetails(movie.media_type, movie.id);
    const runtime = details.runtime;

    // TODO: check if exact match is good
    return duration === runtime;
  });

  if (movie) {
    console.log(
      name + " -> " + (movie.name ?? movie.title) + " (runtime match)"
    );
    return movie;
  }

  console.log("no best result for " + name);
  return movies[0];
};

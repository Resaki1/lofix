import { Movie } from "../types/types";

const TMDB_API_KEY = "da2b03ca0b0a10e22f32080f94056b75";

export const getMovieDetails = (name: string, duration: number): any => {
  const nameToSearch = encodeURIComponent(name.normalize());

  return fetch(
    // TODO: add localization for better exact match results
    `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${nameToSearch}&language=de-DE`
  )
    .then((res) => res.json())
    .then(async (res) => {
      if (res.results.length === 0) console.log(`${name}: no match found`);
      // TODO: take collections into consideration
      // TODO: chain queries: https://developers.themoviedb.org/3/getting-started/append-to-response
      let currentBestMovie: Movie | undefined;
      let currentBestRuntime: number;
      let exactMatchFound = false;

      await Promise.all(
        res.results.map(async (movie: any) => {
          if (exactMatchFound) return;

          // return details if file name is exact match
          // TODO: first sort movies by popularity to improve results
          if (
            name.normalize().toLowerCase() ===
              movie.original_title.normalize().toLowerCase() ||
            name.normalize().toLowerCase() ===
              movie.title.normalize().toLowerCase()
          ) {
            console.log(
              "exact match found: " + name + " == " + movie.original_title
            );

            exactMatchFound = true;
            return await getDetails("movie", movie.id).then((result) => {
              currentBestMovie = result;
            });
          } else {
            await getDetails("movie", movie.id).then((result) => {
              const runtimeDeviation = duration / 60 / result.runtime;
              if (
                !currentBestMovie ||
                Math.abs(runtimeDeviation - 1) < currentBestRuntime
              ) {
                currentBestRuntime = Math.abs(runtimeDeviation - 1);
                currentBestMovie = movie;
              }
            });
          }
        })
      );

      return currentBestMovie;
    })
    .catch((error) => console.log(error));
};

export const getDetails = async (type: "movie", id: number) => {
  return await fetch(
    `https://api.themoviedb.org/3/${type}/${id}?api_key=${TMDB_API_KEY}&language=de-DE`
  ).then((res) => res.json());
};

export const getImage = (path: string) => {
  return fetch(`https://image.tmdb.org/t/p/w500${path}`)
    .then((res) => res.blob())
    .then((result) => {
      return result;
    })
    .catch((error) => console.log(error));
};

export const getMoviePoster = (id: number) => {
  return fetch(
    `https://api.themoviedb.org/3/movie/${id}/images?api_key=${TMDB_API_KEY}&language=de-DE&include_image_language=en`
  )
    .then((res) => res.json())
    .then((result) => {
      console.log(result);
      // get best poster path
      let path;
      let bestRating = 0;
      result.posters?.forEach((poster: any) => {
        if (poster.vote_average > bestRating) path = poster.file_path;
      });
      // TODO: return placeholder image if no poster is found
      // get image
      return fetch(`https://image.tmdb.org/t/p/w500${path}`)
        .then((res) => res.blob())
        .then((result) => {
          return result;
        });
    })
    .catch((error) => console.log(error));
};

export const getMovieBackdrop = (id: number) => {
  return fetch(
    `https://api.themoviedb.org/3/movie/${id}/images?api_key=${TMDB_API_KEY}&language=de-DE&include_image_language=en`
  )
    .then((res) => res.json())
    .then((result) => {
      // get best backdrop path
      let path;
      let bestRating = 0;
      result.backdrops?.forEach((backdrop: any) => {
        if (backdrop.vote_average > bestRating) path = backdrop.file_path;
      });
      // TODO: return placeholder image if no backdrop is found
      // get image
      return fetch(`https://image.tmdb.org/t/p/w500${path}`)
        .then((res) => res.blob())
        .then((result) => {
          return result;
        });
    })
    .catch((error) => console.log(error));
};

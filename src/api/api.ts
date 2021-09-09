const TMDB_API_KEY = "da2b03ca0b0a10e22f32080f94056b75";

export const getMovieDetails = (name: string): any => {
  const nameToSearch = name
    .replaceAll(" ", "+")
    .replaceAll("_", "+")
    .split(".")
    .slice(0, -1)
    .join(".");

  return fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${nameToSearch}`
  )
    .then((res) => res.json())
    .then((res) => {
      console.log(name + ":");
      console.log(res);

      // TODO: better score system: take exact name match, original title and movie length into consideration
      // TODO: get all movie details: https://developers.themoviedb.org/3/movies/get-movie-details
      // TODO: chain queries: https://developers.themoviedb.org/3/getting-started/append-to-response
      let currentBestMovie: any;
      res.results.forEach((movie: any) => {
        if (!currentBestMovie || currentBestMovie.popularity < movie.popularity)
          currentBestMovie = movie;
      });

      console.log(currentBestMovie);
      console.log("____________________________________");
      return currentBestMovie;
    })
    .catch((error) => console.log(error));
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
    `https://api.themoviedb.org/3/movie/${id}/images?api_key=${TMDB_API_KEY}&language=en-US&include_image_language=en`
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
    `https://api.themoviedb.org/3/movie/${id}/images?api_key=${TMDB_API_KEY}&language=en-US&include_image_language=en`
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

const TMDB_API_KEY = "da2b03ca0b0a10e22f32080f94056b75";

export const getMovieDetails = (name: string, duration: number): any => {
  const fileName = name.split(".").slice(0, -1).join(".");
  const nameToSearch = encodeURIComponent(fileName.normalize());

  return fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${nameToSearch}`
  )
    .then((res) => res.json())
    .then(async (res) => {
      if (res.results.length === 0) console.log(`${fileName}: no match found`);
      // TODO: better score system: take exact name match, original title and movie length into consideration
      // TODO: chain queries: https://developers.themoviedb.org/3/getting-started/append-to-response
      let currentBestMovie: any;
      let currentBestRuntime: number;
      let exactMatchFound = false;

      await Promise.all(
        res.results.map(async (movie: any) => {
          if (exactMatchFound) return;
          let details;

          // return details if file name is exact match
          if (fileName.normalize() == movie.original_title.normalize()) {
            console.log(
              "exact match found: " + fileName + " == " + movie.original_title
            );

            exactMatchFound = true;
            return await fetch(
              `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_API_KEY}`
            )
              .then((res) => res.json())
              .then((result) => {
                currentBestMovie = result;
              });
          } else {
            let runtimeDeviation: number;
            await fetch(
              `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_API_KEY}`
            )
              .then((res) => res.json())
              .then((result) => {
                console.log(
                  `${fileName}: ${Math.round(duration / 60)}, ${
                    result.original_title
                  }: ${result.runtime}`
                );

                runtimeDeviation = duration / 60 / result.runtime;
                details = result;

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

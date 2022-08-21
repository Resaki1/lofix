const TMDB_API_KEY = process.env.REACT_APP_API_KEY;

export const searchByName = async (name: string): Promise<any[]> => {
  return fetch(
    // TODO: add localization for better exact match results
    `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
      name.normalize()
    )}&language=de-DE`
  )
    .then((res) => res.json())
    .then((response) => {
      return response.results;
    })
    .catch((error) => console.error(error));
};

export const getDetails = async (type: "movie", id: number) => {
  return await fetch(
    `https://api.themoviedb.org/3/${type}/${id}?api_key=${TMDB_API_KEY}&language=de-DE`
  )
    .then((res) => res.json())
    .catch((error) => console.error(error));
};

export const getImage = (path: string, width: number) => {
  return fetch(`https://image.tmdb.org/t/p/w${width}${path}`)
    .then((res) => res.blob())
    .then((result) => {
      return result;
    })
    .catch((error) => console.log(error));
};

/* export const getMoviePoster = (id: number) => {
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
}; */

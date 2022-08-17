import React from "react";
import { values } from "idb-keyval";
import MovieCard from "../MovieCard/MovieCard";
import { Movie } from "../../types/types";
import { mapDirectoryToMovies } from "../../functions/mapping";
import "./Movies.scss";
import { Film } from "react-feather";

const Movies = () => {
  const [movies, setMovies] = React.useState<Movie[]>();
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleClick = async () => {
    // open file picker
    const dirHandle: FileSystemDirectoryHandle =
      await window.showDirectoryPicker({
        multiple: true,
      });
    setLoading(true);
    /* await set("directory", dirHandle); */
    mapDirectoryToMovies(dirHandle, setMovies).then(() => setLoading(false));
  };

  React.useEffect(() => {
    values().then((values) => {
      setMovies(values);
    });
  }, []);

  return (
    <main className="moviesWrapper">
      <button onClick={handleClick} className="addMoviesButton">
        <Film size={20} /> Add your movies!
      </button>
      <div className="movies">
        {loading && <h1>loading</h1>}
        {movies &&
          movies.map((movie: Movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
      </div>
    </main>
  );
};

export default Movies;

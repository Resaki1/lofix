import { useState } from "react";
import MovieCard from "../MovieCard/MovieCard";
import { Movie } from "../../types/types";
import { mapDirectoryToMovies } from "../../functions/mapping";
import "./Movies.scss";
import { Film } from "react-feather";
import { useMovieStore } from "../../store/store";

const Movies = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const movies = useMovieStore((state) => state.movies);
  const addMovie = useMovieStore((state) => state.addMovie);

  const handleClick = async () => {
    // open file picker
    const dirHandle: FileSystemDirectoryHandle =
      await window.showDirectoryPicker({
        multiple: true,
      });
    setLoading(true);
    /* await set("directory", dirHandle); */
    mapDirectoryToMovies(dirHandle, addMovie).then(() => setLoading(false));
  };

  return (
    <main className="moviesWrapper">
      <button onClick={handleClick} className="addMoviesButton">
        <Film size={20} /> Filme hinzufügen
      </button>
      <ol className="movies">
        {loading && <h1>lädt</h1>}
        {movies &&
          movies.map((movie: Movie) => (
            <li key={movie.id}>
              <MovieCard key={movie.id} movie={movie} />
            </li>
          ))}
      </ol>
    </main>
  );
};

export default Movies;

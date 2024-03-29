import { useEffect, useState } from "react";
import MovieCard from "../MovieCard/MovieCard";
import { Movie } from "../../types/types";
import { mapDirectoryToMovies } from "../../functions/mapping";
import "./Movies.scss";
import { Film } from "react-feather";
import { useMovieStore } from "../../store/store";

const Movies = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const key = useMovieStore((state) => state.key);
  const movies = useMovieStore((state) => state.movies);
  const addMovie = useMovieStore((state) => state.addMovie);
  const unmappedMovies = useMovieStore((state) => state.unmappedMovies);
  const addUnmappedMovie = useMovieStore((state) => state.addUnmappedMovie);

  const handleClick = async () => {
    // open file picker
    const dirHandle: FileSystemDirectoryHandle =
      await window.showDirectoryPicker({
        multiple: true,
      });
    setLoading(true);
    /* await set("directory", dirHandle); */
    mapDirectoryToMovies(dirHandle, addMovie, addUnmappedMovie).then(() =>
      setLoading(false)
    );
  };

  return (
    <main className="moviesWrapper" key={key}>
      <button
        onClick={handleClick}
        disabled={loading}
        className="addMoviesButton"
      >
        <Film size={20} /> Filme hinzufügen
      </button>
      <ol className="movies">
        {movies &&
          movies.map((movie: Movie) => (
            <li key={movie.id}>
              <MovieCard key={movie.id} movie={movie} />
            </li>
          ))}
      </ol>
      {unmappedMovies.length > 0 && (
        <>
          <h2>Ohne Ergebnis</h2>
          <ol className="movies">
            {unmappedMovies?.map((name: string) => (
              <li key={name}>
                <MovieCard key={name} movie={{ name }} />
              </li>
            ))}
          </ol>
        </>
      )}
    </main>
  );
};

export default Movies;

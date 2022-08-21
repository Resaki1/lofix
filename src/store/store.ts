import create from "zustand";
import { devtools, persist } from "zustand/middleware";
import { Movie } from "../types/types";

interface MovieState {
  movies: Movie[];
  addMovie: (movie: Movie) => void;
  changeMovie: (oldId: number, newMovie: any) => void;
  unmappedMovies: string[];
  addUnmappedMovie: (movie: string) => void;
  key: number;
}

export const useMovieStore = create<MovieState>()(
  devtools(
    persist(
      (set) => ({
        movies: [],
        addMovie: (movie) =>
          set((state) => {
            const index = state.movies.findIndex((m) => m.id === movie.id);
            if (index !== -1) return state;
            return { movies: [...state.movies, movie] };
          }),
        changeMovie: (oldId, newMovie) =>
          set((state) => {
            let newMovies = state.movies;
            let index = newMovies.findIndex((m) => m.id === oldId);

            newMovies[index] = {
              ...newMovies[index],
              id: Number(newMovie.id),
              name: newMovie.title ?? newMovie.name,
              date:
                newMovie.release_date?.split("-")[0] ??
                newMovie.first_air_date?.split("-")[0],
              genres: newMovie.genres,
              overview: newMovie.overview,
              rating: newMovie.vote_average,
            };

            return { movies: newMovies, key: state.key + 1 };
          }),
        unmappedMovies: [],
        addUnmappedMovie: (movie) =>
          set((state) => {
            const index = state.unmappedMovies.findIndex((m) => m === movie);
            if (index !== -1) return state;
            return { unmappedMovies: [...state.unmappedMovies, movie] };
          }),
        key: 0,
      }),
      {
        name: "movie-storage",
      }
    )
  )
);

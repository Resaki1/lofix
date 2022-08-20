import create from "zustand";
import { devtools, persist } from "zustand/middleware";
import { Movie } from "../types/types";

interface MovieState {
  movies: Movie[];
  addMovie: (movie: Movie) => void;
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
      }),
      {
        name: "movie-storage",
      }
    )
  )
);

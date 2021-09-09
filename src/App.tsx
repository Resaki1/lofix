import React from "react";
import { values, set } from "idb-keyval";
import { getMovieDetails, getImage } from "./api/api";
import "./App.css";
import MovieCard from "./components/MovieCard/MovieCard";

function App() {
  const [movies, setMovies]: any[] = React.useState();
  const [loading, setLoading]: any[] = React.useState(false);

  const handleClick = async () => {
    // open file picker
    const dirHandle = await (window as any).showDirectoryPicker({
      multiple: true,
    });
    setLoading(true);
    await set("directory", dirHandle);

    let entries = [];
    // loop over all entries in directory
    for await (const fileHandle of dirHandle.values()) {
      // check if entry is a video file
      if (fileHandle.kind === "file") {
        const file = await fileHandle.getFile();
        if (file.type === "video/mp4") {
          const searchResult = await getMovieDetails(fileHandle.name);

          if (searchResult) {
            const movie = {
              id: searchResult.id,
              name: searchResult.original_title,
              poster: await getImage(searchResult.poster_path),
              backdrop: await getImage(searchResult.backdrop_path),
              fileHandle: fileHandle,
            };
            await set(movie.id, movie);
            entries.push(movie);
          }
        }
      }
    }
    setLoading(false);
    // TODO: add movies one by one for better loading experience
    setMovies(entries);
  };

  React.useEffect(() => {
    values().then((values) => {
      setMovies(values);
    });
  }, []);

  return (
    <div className="App">
      <button onClick={handleClick}>choose directory</button>
      <div className="movies">
        {loading && <h1>loading</h1>}
        {movies &&
          movies.map((movie: any) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
      </div>
    </div>
  );
}

export default App;

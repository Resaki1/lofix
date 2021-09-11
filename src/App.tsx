import React from "react";
import { values, set, update } from "idb-keyval";
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

    // loop over all entries in directory
    for await (const fileHandle of dirHandle.values()) {
      // check if entry is a video file
      // TODO: recursively also include subfolders
      if (fileHandle.kind === "file") {
        const file = await fileHandle.getFile();

        if (file.type === "video/mp4") {
          // get video duration
          let duration = 0;
          let video = document.createElement("video");
          video.setAttribute("src", window.URL.createObjectURL(file));

          video.onloadeddata = async function () {
            duration = video.duration;
            const searchResult = await getMovieDetails(
              fileHandle.name,
              duration
            );
            if (searchResult) {
              console.log(
                fileHandle.name + " -> " + searchResult.original_title
              );

              const movie = {
                id: searchResult.id,
                name: searchResult.original_title,
                // TODO: look for images if no path is given
                poster: await getImage(searchResult.poster_path),
                backdrop: await getImage(searchResult.backdrop_path),
                fileHandle: fileHandle,
              };

              update(movie.id, () => movie).then(() =>
                values().then((values) => setMovies(values))
              );
            }
          };
        }
      }
    }
    setLoading(false);
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

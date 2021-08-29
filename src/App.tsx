import React from 'react';
import { values, set } from 'idb-keyval';
import { getMovieDetails, getMovieBackdrop, getMoviePoster } from "./api/api"
import Popup from "./components/Popup/Popup";
import './App.css';
import MovieCard from './components/MovieCard/MovieCard';

function App() {
  const [movies, setMovies]: any[] = React.useState()
  const [loading, setLoading]: any[] = React.useState(false)

  const handleClick = async () => {
    // open file picker
    const dirHandle = await (window as any).showDirectoryPicker({ multiple: true })
    setLoading(true)
    await set("directory", dirHandle);

    let entries = [];
    // loop over all entries in directory
    for await (const fileHandle of dirHandle.values()) {
      // check if entry is a video file
      if (fileHandle.kind === "file") {
        const file = await fileHandle.getFile()
        if (file.type === "video/mp4") {
          const searchResult = await getMovieDetails(fileHandle.name);

          if (searchResult.results.length > 0) {
            const movie = {
              id: searchResult.results[0].id,
              name: searchResult.results[0].original_title,
              poster: await getMoviePoster(searchResult.results[0].id),
              backdrop: await getMovieBackdrop(searchResult.results[0].id),
              fileHandle: fileHandle,
            }
            await set(movie.id, movie)
            entries.push(movie)
          }
        }
      }
    }
    setLoading(false)
    // TODO: add movies one by one for better loading experience
    setMovies(entries)
  }

  React.useEffect(() => {
    values().then((values) => {
      setMovies(values)
    })
  }, [])

  return (
    <div className="App">
      <button onClick={handleClick}>choose directory</button>
      <div className="movies">
        {
          loading && <h1>loading</h1>
        }
        {
          movies && movies.map((movie: any) => <MovieCard key={movie.id} movie={movie} />)
        }
      </div>
    </div>
  );
}

export default App;

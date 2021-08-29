import React from 'react';
import { values, set } from 'idb-keyval';
import { getMovieDetails, getMovieBackdrop } from "./api/api"
import Popup from "./components/Popup/Popup";
import './App.css';

function App() {
  const [movies, setMovies]: any[] = React.useState()
  const [showPopup, setShowPopup] = React.useState(false)

  const handleClick = async () => {
    // open file picker
    const dirHandle = await (window as any).showDirectoryPicker({ multiple: true })
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
              backdrop: await getMovieBackdrop(searchResult.results[0].id),
              fileHandle: fileHandle,
            }
            await set(movie.id, movie)
            entries.push(movie)
          }
        }
      }
    }
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
      {
        movies && movies.map((movie: any) =>
          <div key={movie.name}>
            <p onClick={() => setShowPopup(movie.name)}>{movie.name}</p>
            {showPopup === movie.name && <Popup movie={movie} close={() => setShowPopup(false)} />}
          </div>)
      }
    </div>
  );
}

export default App;

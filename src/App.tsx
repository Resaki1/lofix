import React from 'react';
import ReactPlayer from 'react-player'
import { values, set } from 'idb-keyval';
import Popup from "./components/Popup/Popup";
import './App.css';

function App() {
  const [source, setSource] = React.useState("")
  const [movies, setMovies]: any[] = React.useState()
  const [showPopup, setShowPopup] = React.useState(false)

  const addMovies = (files: FileList): void => {
    console.log(files[0])
    setSource(URL.createObjectURL(files[0]))
  }

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
          const nameToSearch = fileHandle.name.replaceAll(" ", "+").replaceAll("_", "+").split('.').slice(0, -1).join('.')

          // request movie details from tmdb
          const response = fetch(`https://api.themoviedb.org/3/search/movie?api_key=da2b03ca0b0a10e22f32080f94056b75&query=${nameToSearch}`)
            .then(res => res.json())
            .catch(error => console.log(error))

          const searchResult = await response;

          if (searchResult.results.length > 0) {
            const movie = {
              name: searchResult.results[0].original_title,
              fileHandle: fileHandle,
            }
            await set(movie.name, movie)
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
      <header className="App-header">
      </header>
      <input type="file" id="files" accept="video/*" multiple onChange={(e) => e.target.files && addMovies(e.target.files)}></input>
      <ReactPlayer playing url={source} />
      <button onClick={handleClick}>choose directory</button>
      <button onClick={() => console.log(movies)}>test</button>
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

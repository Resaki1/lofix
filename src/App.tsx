import React from 'react';
import ReactPlayer from 'react-player'
import './App.css';

function App() {
  const [source, setSource] = React.useState("")
  const [movies, setMovies]: any[] = React.useState()

  const addMovies = (files: FileList): void => {
    console.log(files[0])
    setSource(URL.createObjectURL(files[0]))
  }

  const handleClick = async () => {
    // open file picker
    const dirHandle = await (window as any).showDirectoryPicker({ multiple: true });

    let entries = [];
    for await (const fileHandle of dirHandle.values()) {
      const file = {
        name: fileHandle.name,
        fileHandle: fileHandle,
      }
      entries.push(file)
    }
    setMovies(entries)
  }

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
          <>
            <p>{movie.name}</p>
          </>)
      }
    </div>
  );
}

export default App;

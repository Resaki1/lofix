const TMDB_API_KEY = "da2b03ca0b0a10e22f32080f94056b75"

export const getMovieDetails = (name: string): Promise<any> => {
    const nameToSearch = name.replaceAll(" ", "+").replaceAll("_", "+").split('.').slice(0, -1).join('.')


    const response = fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${nameToSearch}`)
        .then(res => res.json())
        .catch(error => console.log(error))
    return response
}

export const getMovieBackdrop = (id: number) => {
    return fetch(`https://api.themoviedb.org/3/movie/${id}/images?api_key=${TMDB_API_KEY}`)
        .then(res => res.json())
        .then((result) => {
            // get best backdrop path
            let path;
            let bestRating = 0;
            result.backdrops?.forEach((backdrop: any) => {
                if (backdrop.vote_average > bestRating) path = backdrop.file_path
            })
            // TODO: return placeholder image if no backdrop is found
            // get image
            return fetch(`https://image.tmdb.org/t/p/w500${path}`)
                .then(res => res.blob())
                .then((result) => { return result })
        })
        .catch(error => console.log(error))
}
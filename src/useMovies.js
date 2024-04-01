import { useEffect, useState } from "react";

const KEY = "1a0e66c6";

export function useMovies(query, callback){
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(
        function () {
          callback?.();
          const controller = new AbortController(); //To cleanup HTTP requests from memory
    
          async function fetchMovies() {
            try {
              setIsLoading(true); // Loading : will show that the movie is under searching process
              setError(""); // Initially error should be set to null
    
              //Fetching the movie data from api and by using signal we've connected signal with abortcontroller
              const res = await fetch(
                `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
                { signal: controller.signal }
              );
    
              //If network is not available or went offline suddenly
              if (!res.ok)
                throw new Error("Something went wrong with fetching movies");
    
              const data = await res.json();
              if (data.Response === "False") throw new Error("Movie not found");
              setMovies(data.Search);
              // console.log(data.Search);
            } catch (err) {
              // console.log(err.message);
              if (err.name !== "AbortError") {
                // If we won't set it like this then when we cancel requests to clean up the memory then it will give us the error which we don't want.
                setError(err.message);
              }
            } finally {
              setIsLoading(false);
            }
    
            //Incase no movie has been searched yet then to set setMovies to empty and error to ""
            if (!query.length) {
              setMovies([]);
              setError("");
              return;
            }
          }
        //   handleCloseMovie(); // Removing the results of previous searched movie as soon as we start searching for other.
          fetchMovies();
    
          return function () {
            //cleaning up the data with abortcontroller
            controller.abort();
          };
        },
        [query]
      );
    return {movies, isLoading, error};
}
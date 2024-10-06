import React, { useEffect, useState, useRef, useMemo } from "react";
import StarRating from "./StarRating.js";
import { useMovies } from "./useMovies.js";
import { useLocalStorageState } from "./useLocalStorageaState.js";
import { useKey } from "./useKey.js";

const KEY = "1a0e66c6";

const average = (arr) => arr.reduce((acc, cur) => acc + cur / arr.length, 0);

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [watched, setWatched] = useLocalStorageState([], "watched");

  const handleSelectMovie = (id) => setSelectedId((prevId) => (id === prevId ? null : id));
  const handleCloseMovie = () => setSelectedId(null);
  const handleAddWatched = (movie) => setWatched((prevWatched) => [...prevWatched, movie]);

  const handleDeleteWatched = (id) => {
    setWatched((prevWatched) => prevWatched.filter((movie) => movie.imdbID !== id));
  };

  const { movies, isLoading, error } = useMovies(query, handleCloseMovie);

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList
              movies={movies}
              onSelectMovie={handleSelectMovie}
            />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedId ? (
             <MovieDetails
             selectedId={selectedId}
             onCloseMovie={handleCloseMovie}
             onAddWatched={handleAddWatched}
             watched={watched}
           />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMoviesList watched={watched} onDeleteWatched={handleDeleteWatched} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

const Loader = () => <p className="loader">Loading...</p>;

const ErrorMessage = ({ message }) => <p className="error">{message}</p>;

const NavBar = ({ children }) => <nav className="nav-bar">{children}</nav>;

const Logo = () => (
  <div className="logo">
    <span role="img">🍿</span>
    <h1>usePopcorn</h1>
  </div>
);

const Search = ({ query, setQuery }) => {
  const inputEl = useRef(null);

  useKey('Enter', () => {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
};

const NumResults = ({ movies }) => (
  <p className="num-results">
    Found <strong>{movies.length}</strong> results
  </p>
);

const Main = ({ children }) => <main className="main">{children}</main>;

const Box = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
};

const MovieList = React.memo(({ movies, onSelectMovie }) => (
  <ul className="list list-movies">
    {movies.map((movie) => (
      <Movie key={movie.imdbID} movie={movie} onSelectMovie={onSelectMovie} />
    ))}
  </ul>
));

const Movie = React.memo(({ movie, onSelectMovie }) => (
  <li onClick={() => onSelectMovie(movie.imdbID)}>
    <img src={movie.Poster} alt={`${movie.Title} poster`} />
    <h3>{movie.Title}</h3>
    <div>
      <p>
        <span>🗓</span>
        <span>{movie.Year}</span>
      </p>
    </div>
  </li>
));

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");

  const isWatched = watched.some((movie) => movie.imdbID === selectedId);
  const watchedUserRating = watched.find((movie) => movie.imdbID === selectedId)?.userRating;

  useKey('Escape', onCloseMovie);

  useEffect(() => {
    async function fetchMovieDetails() {
      setIsLoading(true);
      const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    }
    fetchMovieDetails();
  }, [selectedId]);

  useEffect(() => {
    if (!movie.Title) return;
    document.title = `Movie | ${movie.Title}`;
    return () => {
      document.title = `usePopcorn`;
    };
  }, [movie.Title]);

  const handleAdd = () => {
    const newWatchedMovie = {
      imdbID: selectedId,
      title: movie.Title,
      year: movie.Year,
      poster: movie.Poster,
      imdbRating: Number(movie.imdbRating),
      runtime: Number(movie.Runtime.split(" ")[0]),
      userRating,
    };
    onAddWatched(newWatchedMovie);
  };

  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={movie.Poster} alt={`Poster of ${movie.Title}`} />
            <div className="details-overview">
              <h2>{movie.Title}</h2>
              <p>{movie.Year}</p>
              <p>
                {movie.Released} &bull; {movie.Runtime}
              </p>
              <p>{movie.Genre}</p>
              <p>
                <span>⭐</span>
                {movie.imdbRating} IMDb Rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to List
                    </button>
                  )}
                </>
              ) : (
                <p>You rated this movie {watchedUserRating}</p>
              )}
            </div>
            <p><em>{movie.Plot}</em></p>
            <p>Starring {movie.Actors}</p>
            <p>Directed by {movie.Director}</p>
          </section>
        </>
      )}
    </div>
  );
}

const WatchedSummary = ({ watched }) => {
  const avgImdbRating = useMemo(() => average(watched.map((movie) => movie.imdbRating)), [watched]);
  const avgUserRating = useMemo(() => average(watched.map((movie) => movie.userRating)), [watched]);
  const avgRuntime = useMemo(() => average(watched.map((movie) => movie.runtime)), [watched]);

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p><span>#️⃣</span><span>{watched.length} movies</span></p>
        <p><span>⭐️</span><span>{avgImdbRating.toFixed(2)}</span></p>
        <p><span>🌟</span><span>{avgUserRating.toFixed(2)}</span></p>
        <p><span>⏳</span><span>{avgRuntime} min</span></p>
      </div>
    </div>
  );
};

const WatchedMoviesList = React.memo(({ watched, onDeleteWatched }) => (
  <ul className="list">
    {watched.map((movie) => (
      <WatchedMovie
        key={movie.imdbID}
        movie={movie}
        onDeleteWatched={onDeleteWatched}
      />
    ))}
  </ul>
));

const WatchedMovie = React.memo(({ movie, onDeleteWatched }) => (
  <li>
    <img src={movie.poster} alt={`${movie.title} poster`} />
    <h3>{movie.title}</h3>
    <div>
      <p><span>⭐️</span><span>{movie.imdbRating}</span></p>
      <p><span>🌟</span><span>{movie.userRating}</span></p>
      <p><span>⏳</span><span>{movie.runtime} min</span></p>
    </div>
    <button
      className="btn-delete"
      onClick={() => onDeleteWatched(movie.imdbID)}
    >
      X
    </button>
  </li>
));


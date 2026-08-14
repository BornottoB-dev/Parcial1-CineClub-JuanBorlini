import React from 'react';
import MovieCard from './MovieCard';

const MovieGrid = ({ movies, handleMovieSelect }) => {
  return (
    <section className="results-section animate-fade-in">
      <h3 className="results-title">Resultados de la Búsqueda</h3>
      <div className="movie-grid">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onClick={() => handleMovieSelect(movie.id)}
          />
        ))}
      </div>
    </section>
  );
};

export default MovieGrid;

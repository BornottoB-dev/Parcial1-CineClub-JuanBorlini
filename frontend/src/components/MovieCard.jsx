import React from 'react';
import TicketIcon from './TicketIcon';

const MovieCard = ({ movie, onClick }) => {
  const getYear = (dateStr) => {
    if (!dateStr) return 'N/A';
    return dateStr.split('-')[0];
  };

  return (
    <div className="movie-card" onClick={onClick}>
      <div className="card-poster-wrapper">
        {movie.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="card-poster"
          />
        ) : (
          <div className="card-poster-fallback">
            <TicketIcon />
          </div>
        )}
        <div className="card-overlay">
          <span className="btn-details">Ver Detalle</span>
        </div>
      </div>
      <div className="card-info">
        <h4 className="card-title">{movie.title}</h4>
        <div className="card-meta">
          <span className="card-year">{getYear(movie.release_date)}</span>
          <span className="card-score">
            ★ {movie.avgScore !== null && movie.avgScore !== undefined ? movie.avgScore : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;

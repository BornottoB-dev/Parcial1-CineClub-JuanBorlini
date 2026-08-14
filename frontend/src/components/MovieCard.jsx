import React from 'react';

const TicketIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2, color: 'var(--accent-gold)' }}>
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
    <path d="M13 11v2" />
  </svg>
);

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

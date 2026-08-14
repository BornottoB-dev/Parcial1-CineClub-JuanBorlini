import React from 'react';

const SearchBar = ({ searchQuery, setSearchQuery, handleSearch }) => {
  return (
    <form onSubmit={handleSearch} className="search-box">
      <input
        type="text"
        placeholder="Introduce el título de la película o director..."
        className="search-input"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        required
      />
      <button type="submit" className="search-btn">
        Buscar
      </button>
    </form>
  );
};

export default SearchBar;

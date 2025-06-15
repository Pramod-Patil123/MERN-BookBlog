import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useFavorites } from '../context/FavoritesContext';
import './BookCardPage.css';

const BookCard = ({ id, title, author, genre, image }) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const toggleFavorite = () => {
    if (isFavorite(id)) {
      removeFavorite(id);
    } else {
      addFavorite({ id, title, author, genre, image });
    }
  };

  return (
    <div className="book-card" role="article" aria-label={`Book: ${title}`}>
      <div className="book-image">
        <img src={image} alt={`Cover of ${title}`} />
      </div>
      <div className="book-info">
        <h3 className="book-title">{title}</h3>
        <p className="book-author">by {author}</p>
        <span className="book-genre">{genre}</span>
        <button
          className={`favorite-btn ${isFavorite(id) ? 'remove' : 'add'}`}
          onClick={toggleFavorite}
          aria-label={isFavorite(id) ? 'Remove from Favorites' : 'Add to Favorites'}
        >
          {isFavorite(id) ? 'Remove from Favorites' : 'Add to Favorites'}
        </button>
      </div>
    </div>
  );
};

BookCard.propTypes = {
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  genre: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
};

const BookCardPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        await new Promise((res) => setTimeout(res, 500)); // Fake loading
        const mockData = [
          {
            id: 1,
            title: 'Atomic Habits',
            author: 'James Clear',
            genre: 'Self-help',
            image: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383',
          },
          {
            id: 2,
            title: '1984',
            author: 'George Orwell',
            genre: 'Dystopian',
            image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765',
          },
        ];
        setBooks(mockData);
        setLoading(false);
      } catch {
        setError('Failed to load books.');
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) return <div className="book-page">Loading books...</div>;
  if (error) return <div className="book-page error">{error}</div>;

  return (
    <div className="book-page">
      {books.map((book) => (
        <BookCard key={book.id} {...book} />
      ))}
    </div>
  );
};

export default BookCardPage;

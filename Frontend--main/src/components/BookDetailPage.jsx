import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';

const BookDetailPage = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ user: '', rating: 5, comment: '' });

  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  useEffect(() => {
    // Simulate fetching book data
    const fakeBook = {
      id: parseInt(bookId),
      title: 'Sample Book',
      author: 'Author Name',
      genre: 'Fiction',
      cover: 'https://images.unsplash.com/photo-1606112219348-204d7d8b94ee',
      description: 'A great book about something very interesting.',
      published: '2022',
      rating: 4.5,
    };
    setBook(fakeBook);

    // Simulate fetching reviews
    const fakeReviews = [
      { user: 'John', rating: 5, comment: 'Loved it!' },
      { user: 'Jane', rating: 4, comment: 'Great read.' },
    ];
    setReviews(fakeReviews);
  }, [bookId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setReviews([...reviews, newReview]);
    setNewReview({ user: '', rating: 5, comment: '' });
  };

  if (!book) return <div className="p-6">Loading book details...</div>;

  const handleFavoriteToggle = () => {
    isFavorite(book.id) ? removeFavorite(book.id) : addFavorite(book);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex gap-6 mb-10">
        <img
          src={book.cover}
          alt={book.title}
          className="w-40 h-60 object-cover rounded-xl shadow-lg"
        />
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold">{book.title}</h1>
          <h2 className="text-lg text-gray-600">by {book.author}</h2>
          <p className="mt-2 text-gray-700">{book.description}</p>
          <div className="mt-4 text-sm text-gray-500 space-y-1">
            <p>Genre: {book.genre}</p>
            <p>Published: {book.published}</p>
            <p>Rating: {book.rating} ⭐</p>
          </div>

          <button
            className={`mt-6 px-4 py-2 rounded-xl text-white text-sm font-semibold w-max
              ${isFavorite(book.id) ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            onClick={handleFavoriteToggle}
          >
            {isFavorite(book.id) ? 'Remove from Favorites' : 'Add to Favorites'}
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mb-10">
        <h3 className="text-2xl font-semibold mb-4">User Reviews</h3>
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-medium">{review.user}</h4>
                <span className="text-yellow-500">{review.rating} ⭐</span>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Review Form */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Submit a Review</h3>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white border p-4 rounded-lg shadow-sm">
          <input
            type="text"
            placeholder="Your name"
            value={newReview.user}
            onChange={(e) => setNewReview({ ...newReview, user: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <select
            value={newReview.rating}
            onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
            className="w-full p-2 border rounded"
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{r} ⭐</option>
            ))}
          </select>
          <textarea
            placeholder="Your review"
            value={newReview.comment}
            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            className="w-full p-2 border rounded"
            rows="3"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Submit Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookDetailPage;

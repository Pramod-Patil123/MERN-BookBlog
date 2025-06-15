import React, { useState, useEffect } from 'react';
import { FaChartLine, FaSpinner, FaExclamationTriangle, FaStar, FaBookOpen, FaBook, FaDownload, FaExternalLinkAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Import BookReader component
import BookReader from './BookReader';
// Import sample data for fallback
import { BOOKS_DATA } from '../data/books';

// Use environment variable for API key
const GOOGLE_BOOKS_API_KEY = process.env.REACT_APP_GOOGLE_BOOKS_API_KEY;
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

// Helper function to check if API key is valid
const isValidApiKey = (key) => {
  return key && typeof key === 'string' && key.trim() !== '';
};

// Global flag to track if API key is expired or invalid
let isApiKeyExpired = false;

// Helper function to format books data consistently
const formatBooksData = (items) => {
  return items.map(item => {
    const volumeInfo = item.volumeInfo || {};

    return {
      id: item.id || `temp-${Math.random().toString(36).substring(2, 9)}`,
      title: volumeInfo.title || 'Unknown Title',
      author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
      description: volumeInfo.description || 'No description available',
      rating: volumeInfo.averageRating || 0,
      genre: volumeInfo.categories ? volumeInfo.categories[0] : 'Uncategorized',
      imageUrl: volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=No+Cover',
      previewLink: volumeInfo.previewLink || null
    };
  });
};

// Trending topics to fetch books for
const TRENDING_TOPICS = [
  'New York Times Bestseller',
  'Award Winners',
  'Science Fiction',
  'Fantasy',
  'Business',
  'Self Help'
];

const TrendingBooks = () => {
  // Navigation hook
  const navigate = useNavigate();

  const [trendingBooks, setTrendingBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(TRENDING_TOPICS[0]);

  // Book Reader state
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  // Fetch trending books when component mounts or topic changes
  useEffect(() => {
    const fetchTrendingBooks = async () => {
      // Check if API key is valid or if it's already known to be expired
      if (!isValidApiKey(GOOGLE_BOOKS_API_KEY) || isApiKeyExpired) {
        // Show appropriate error message
        if (isApiKeyExpired) {
          console.warn('API Key is expired. Using sample data instead.');
          setError('API key expired. Please renew the API key. Using sample data instead.');
        } else {
          console.warn('API Key is missing or invalid. Using sample data instead.');
          setError('Using sample data - API key is missing or invalid');
        }

        // Filter sample data by selected topic
        const topicLower = selectedTopic.toLowerCase();
        const filteredBooks = BOOKS_DATA.filter(book =>
          book.genre && book.genre.toLowerCase().includes(topicLower)
        ).slice(0, 8);

        // If no books match the topic, just return some random books
        if (filteredBooks.length === 0) {
          setTrendingBooks(BOOKS_DATA.slice(0, 8));
        } else {
          setTrendingBooks(filteredBooks);
        }

        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Build search parameters
        let searchParams = new URLSearchParams();
        searchParams.append('q', `subject:${encodeURIComponent(selectedTopic)}`);
        searchParams.append('orderBy', 'relevance');
        searchParams.append('maxResults', '8');
        searchParams.append('key', GOOGLE_BOOKS_API_KEY);

        // Make the API request with timeout
        const response = await axios.get(`${GOOGLE_BOOKS_API_URL}?${searchParams.toString()}`, {
          timeout: 8000 // 8 second timeout
        });

        if (response.data && response.data.items) {
          // Use our helper function to format books consistently
          const formattedBooks = formatBooksData(response.data.items);
          setTrendingBooks(formattedBooks);
        } else {
          setTrendingBooks([]);
        }
      } catch (error) {
        console.error('Error fetching trending books:', error);

        // Provide more specific error messages
        const errorMessage = error.response?.data?.error?.message || '';

        // Check for expired API key specifically
        if (errorMessage.includes('API key expired') ||
            errorMessage.includes('API key not valid') ||
            errorMessage.toLowerCase().includes('expired')) {
          isApiKeyExpired = true;
          setError('API key expired. Please renew the API key. Using sample data instead.');
          toast.error('API key expired - Using sample data', { autoClose: 5000 });
        }
        else if (error.code === 'ECONNABORTED') {
          setError('Request timed out. Using sample data instead.');
        } else if (error.response?.status === 403) {
          isApiKeyExpired = true;
          setError('API key is invalid or quota exceeded. Using sample data.');
        } else if (error.response?.data?.error?.message) {
          setError(`API Error: ${error.response.data.error.message}. Using sample data.`);
        } else {
          setError('Failed to fetch trending books. Using sample data.');
        }

        toast.warning('Using sample data for trending books');

        // Filter sample data by selected topic as fallback
        const topicLower = selectedTopic.toLowerCase();
        const filteredBooks = BOOKS_DATA.filter(book =>
          book.genre && book.genre.toLowerCase().includes(topicLower)
        ).slice(0, 8);

        // If no books match the topic, just return some random books
        if (filteredBooks.length === 0) {
          setTrendingBooks(BOOKS_DATA.slice(0, 8));
        } else {
          setTrendingBooks(filteredBooks);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingBooks();
  }, [selectedTopic]);

  // Open book reader with selected book
  const openBookReader = (bookId) => {
    setSelectedBookId(bookId);
    setIsReaderOpen(true);
  };

  // Close book reader
  const closeBookReader = () => {
    setIsReaderOpen(false);
    // Wait for animation to complete before clearing the book ID
    setTimeout(() => setSelectedBookId(null), 300);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FaChartLine className="mr-2 text-blue-600" />
          Trending Books
        </h2>
        <div className="flex flex-wrap gap-2">
          {TRENDING_TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-3 py-1 text-sm rounded-full transition-colors duration-300 ${
                selectedTopic === topic
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <FaExclamationTriangle className="inline-block mr-2" />
          {error}
        </div>
      )}

      {/* Books Grid */}
      {!isLoading && trendingBooks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {trendingBooks.map((book) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col"
            >
              <div className="relative h-48 mb-2 overflow-hidden rounded-lg shadow-md group">
                <img
                  src={book.imageUrl}
                  alt={book.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                {book.rating > 0 && (
                  <div className="absolute bottom-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                    <FaStar className="mr-1" />
                    {book.rating}
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openBookReader(book.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors duration-300 flex items-center"
                    >
                      <FaBook className="mr-1" />
                      Quick Read
                    </button>
                    <button
                      onClick={() => navigate(`/read/${book.id}`)}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors duration-300 flex items-center"
                    >
                      <FaExternalLinkAlt className="mr-1" />
                      Full Screen
                    </button>
                    <button
                      onClick={() => openBookReader(book.id)}
                      className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors duration-300 flex items-center"
                    >
                      <FaDownload className="mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
              <h3 className="font-medium text-gray-900 line-clamp-1">{book.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-1">by {book.author}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!isLoading && trendingBooks.length === 0 && !error && (
        <div className="text-center py-8">
          <p className="text-gray-600">No trending books found for this topic.</p>
        </div>
      )}

      {/* Book Reader Modal */}
      <BookReader
        bookId={selectedBookId}
        isOpen={isReaderOpen}
        onClose={closeBookReader}
      />
    </div>
  );
};

export default TrendingBooks;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaSearch, FaStar, FaSpinner, FaExclamationTriangle, FaHeart, FaRegHeart, FaFilter, FaInfoCircle, FaHistory, FaTags, FaChartLine, FaDownload, FaBook, FaExternalLinkAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Import BookReader component
import BookReader from './BookReader';
// Sample data for fallback when API is unavailable
import { BOOKS_DATA } from '../data/books';
// Import dropdown arrow SVG
import { dropdownArrowSvg } from '../utils/icons';

// Use environment variable for API key with fallback
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
    const saleInfo = item.saleInfo || {};

    return {
      id: item.id || `temp-${Math.random().toString(36).substring(2, 9)}`,
      title: volumeInfo.title || 'Unknown Title',
      author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
      description: volumeInfo.description || 'No description available',
      rating: volumeInfo.averageRating || 0,
      genre: volumeInfo.categories ? volumeInfo.categories[0] : 'Uncategorized',
      year: volumeInfo.publishedDate ? volumeInfo.publishedDate.split('-')[0] : 'Unknown',
      imageUrl: volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=No+Cover',
      isbn: volumeInfo.industryIdentifiers?.[0]?.identifier || 'N/A',
      publisher: volumeInfo.publisher || 'Unknown Publisher',
      language: volumeInfo.language || 'Unknown',
      pages: volumeInfo.pageCount || 0,
      price: saleInfo.listPrice?.amount || 0,
      buyLink: saleInfo.buyLink || null,
      previewLink: volumeInfo.previewLink || null,
      publishedDate: volumeInfo.publishedDate || 'Unknown'
    };
  });
};

const BookRecommendation = () => {
  // Navigation hook
  const navigate = useNavigate();

  // Basic state
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const booksPerPage = 6;

  // Advanced search filters
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [selectedRating, setSelectedRating] = useState('All Ratings');
  const [selectedLanguage, setSelectedLanguage] = useState('All Languages');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedAuthor, setSelectedAuthor] = useState('All Authors');

  // Search history
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);

  // Topic browsing
  const [popularTopics, setPopularTopics] = useState([
    'Fiction', 'Science Fiction', 'Fantasy', 'Biography', 'History',
    'Self-Help', 'Business', 'Romance', 'Mystery', 'Thriller'
  ]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showTopics, setShowTopics] = useState(false);

  // Recommendations
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    favoriteGenres: [],
    favoriteAuthors: [],
    readingLevel: 'intermediate'
  });

  // Book Reader state
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  // Refs for components
  const searchInputRef = useRef(null);

  // Get unique genres, years, and ratings for filters
  const genres = ['All Genres', ...new Set(books.map(book => book.genre))];
  const years = ['All Years', ...new Set(books.map(book => book.year))];
  const ratings = ['All Ratings', '4.5+', '4.0+', '3.5+', '3.0+'];
  const languages = ['All Languages', 'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Russian'];
  const authors = ['All Authors', ...new Set(books.map(book => book.author))];

  // Verify API connection on component mount and load initial data
  useEffect(() => {
    const verifyApiConnection = async () => {
      // Check if API key is valid format
      if (!isValidApiKey(GOOGLE_BOOKS_API_KEY)) {
        console.error('API Key is missing or invalid format:', process.env.REACT_APP_GOOGLE_BOOKS_API_KEY);
        setError('Google Books API key is missing or invalid. Using sample data instead.');
        toast.warning('Using sample data - API key is missing');

        // Load sample data as fallback
        const sampleBooks = BOOKS_DATA.slice(0, 12);
        setBooks(sampleBooks);

        // Generate recommendations from sample data
        if (sampleBooks.length > 0) {
          generateRecommendations(sampleBooks);
        }

        return;
      }

      try {
        // Test API connection with minimal query
        console.log('Verifying API connection...');
        const response = await axios.get(`${GOOGLE_BOOKS_API_URL}?q=bestseller&maxResults=1&key=${GOOGLE_BOOKS_API_KEY}`, {
          timeout: 8000 // 8 second timeout
        });

        if (response.status === 200) {
          console.log('API connection successful');
          toast.success('Connected to Google Books API');
          isApiKeyExpired = false;

          // Load initial popular books
          if (response.data && response.data.items) {
            const formattedBooks = formatBooksData(response.data.items);
            setBooks(formattedBooks);

            // Generate initial recommendations
            if (formattedBooks.length > 0) {
              generateRecommendations(formattedBooks);
            }
          }
        }
      } catch (error) {
        console.error('API connection error:', error.response?.data || error);

        // Check for expired API key specifically
        const errorMessage = error.response?.data?.error?.message || '';
        if (errorMessage.includes('API key expired') ||
            errorMessage.includes('API key not valid') ||
            errorMessage.toLowerCase().includes('expired')) {
          isApiKeyExpired = true;
          setError('API key expired. Please renew the API key. Using sample data instead.');
          toast.error('API key expired - Using sample data', { autoClose: 5000 });
        }
        // Provide specific error messages based on error type
        else if (error.response?.status === 403) {
          isApiKeyExpired = true;
          setError('API key is invalid or has exceeded quota. Using sample data instead.');
          toast.error('API key error - Using sample data');
        } else if (error.response?.data?.error?.message) {
          setError(`API Error: ${error.response.data.error.message}. Using sample data.`);
          toast.error('API error - Using sample data');
        } else {
          setError('Failed to connect to Google Books API. Using sample data instead.');
          toast.error('Connection failed - Using sample data');
        }

        // Load sample data as fallback with a more diverse selection
        const sampleBooks = BOOKS_DATA.slice(0, 12);
        setBooks(sampleBooks);

        // Generate recommendations from sample data
        if (sampleBooks.length > 0) {
          generateRecommendations(sampleBooks);
        }
      }
    };

    verifyApiConnection();
  }, []);

  // Advanced search function with filters and topic support
  const advancedSearch = useCallback(async (query, options = {}) => {
    // Build the base search query
    let searchTerms = [];
    
    // Add main search query if exists
    if (query?.trim()) {
      searchTerms.push(query.trim());
    }

    // Add filters to search terms
    if (options.genre && options.genre !== 'All Genres') {
      searchTerms.push(`subject:${options.genre}`);
    }
    
    if (options.author && options.author !== 'All Authors') {
      searchTerms.push(`inauthor:${options.author}`);
    }

    // If no search terms and no topic, use a default search
    if (searchTerms.length === 0 && !options.topic) {
      if (isValidApiKey(GOOGLE_BOOKS_API_KEY) && !isApiKeyExpired) {
        searchTerms.push('subject:general');
      } else {
        // Use sample data with current filters
        const filteredSampleBooks = BOOKS_DATA.filter(book => {
          let matches = true;
          if (options.genre && options.genre !== 'All Genres') {
            matches = matches && book.genre.toLowerCase().includes(options.genre.toLowerCase());
          }
          if (options.year && options.year !== 'All Years') {
            matches = matches && book.year === options.year;
          }
          if (options.language && options.language !== 'All Languages') {
            matches = matches && book.language.toLowerCase() === options.language.toLowerCase();
          }
          if (options.author && options.author !== 'All Authors') {
            matches = matches && book.author.toLowerCase().includes(options.author.toLowerCase());
          }
          if (options.minRating) {
            matches = matches && book.rating >= parseFloat(options.minRating);
          }
          return matches;
      });

      setBooks(filteredSampleBooks.slice(0, 12));
      if (filteredSampleBooks.length > 0) {
        generateRecommendations(filteredSampleBooks);
      }
      return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build search parameters
      let searchParams = new URLSearchParams();

      // Add the combined search query
      if (options.topic) {
        searchParams.append('q', `subject:${encodeURIComponent(options.topic)}`);
        console.log(`Searching for books in topic: ${options.topic}`);
      } else {
        searchParams.append('q', encodeURIComponent(searchTerms.join(' ')));
        console.log('Searching Google Books API with terms:', searchTerms.join(' '));
      }

      // Add API key
      searchParams.append('key', GOOGLE_BOOKS_API_KEY);

      // Add max results
      searchParams.append('maxResults', '40');

      // Add language restriction if specified
      if (options.language && options.language !== 'All Languages') {
        searchParams.append('langRestrict', options.language.toLowerCase());
      }

      // Make the API request with timeout
      const response = await axios.get(`${GOOGLE_BOOKS_API_URL}?${searchParams.toString()}`, {
        timeout: 10000
      });

      if (response.data && response.data.items) {
        // Use our helper function to format books consistently
        let filteredBooks = formatBooksData(response.data.items);

        // Apply client-side filters
        if (options.year && options.year !== 'All Years') {
          filteredBooks = filteredBooks.filter(book => book.year === options.year);
        }

        if (options.minRating && options.minRating !== 'All Ratings') {
          const minRatingValue = parseFloat(options.minRating);
          filteredBooks = filteredBooks.filter(book => book.rating >= minRatingValue);
        }

        if (options.priceRange && options.priceRange.length === 2) {
          const [minPrice, maxPrice] = options.priceRange;
          filteredBooks = filteredBooks.filter(
            book => book.price >= minPrice && book.price <= maxPrice
          );
        }

        console.log('Found books:', filteredBooks.length);
        setBooks(filteredBooks);

        if (filteredBooks.length > 0) {
          generateRecommendations(filteredBooks);
        }

        toast.success(`Found ${filteredBooks.length} books`);
      } else {
        setBooks([]);
        toast.info('No books found. Try different search terms or filters.');
      }
    } catch (error) {
      console.error('Error searching books:', error);

      // Handle API errors
      const errorMessage = error.response?.data?.error?.message || '';

      if (errorMessage.includes('API key expired') ||
          errorMessage.includes('API key not valid') ||
          errorMessage.toLowerCase().includes('expired')) {
        isApiKeyExpired = true;
        setError('API key expired. Using sample data instead.');
        toast.error('API key expired - Using sample data');
      } else if (error.code === 'ECONNABORTED') {
        setError('Search request timed out. Using sample data.');
        toast.error('Search timed out - Using sample data');
      } else if (error.response?.status === 400) {
        setError('Invalid search request. Please try different search terms.');
        toast.error('Invalid search - Try different terms');
      } else {
        setError('Search failed. Using sample data.');
        toast.error('Search failed - Using sample data');
      }

      // Use filtered sample data as fallback
      const filteredSampleBooks = BOOKS_DATA.filter(book => {
        let matches = true;
        if (options.genre && options.genre !== 'All Genres') {
          matches = matches && book.genre.toLowerCase().includes(options.genre.toLowerCase());
        }
        if (options.year && options.year !== 'All Years') {
          matches = matches && book.year === options.year;
        }
        if (options.language && options.language !== 'All Languages') {
          matches = matches && book.language.toLowerCase() === options.language.toLowerCase();
        }
        if (options.author && options.author !== 'All Authors') {
          matches = matches && book.author.toLowerCase().includes(options.author.toLowerCase());
        }
        if (options.minRating) {
          matches = matches && book.rating >= parseFloat(options.minRating);
        }
        return matches;
      });

      setBooks(filteredSampleBooks.slice(0, 12));
      if (filteredSampleBooks.length > 0) {
        generateRecommendations(filteredSampleBooks);
      }
    } finally {
      setIsLoading(false);
    }
  }, [searchHistory]);

  // Generate book recommendations based on user preferences and current search
  const generateRecommendations = useCallback((currentBooks) => {
    // Extract genres and authors from current books
    const genres = [...new Set(currentBooks.map(book => book.genre))];
    const authors = [...new Set(currentBooks.map(book => book.author))];

    // Update user preferences based on current search
    setUserPreferences(prev => ({
      ...prev,
      favoriteGenres: [...new Set([...prev.favoriteGenres, ...genres])].slice(0, 5),
      favoriteAuthors: [...new Set([...prev.favoriteAuthors, ...authors])].slice(0, 5)
    }));

    // For now, just use the top-rated books as recommendations
    const topRatedBooks = [...currentBooks]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);

    setRecommendedBooks(topRatedBooks);
    setShowRecommendations(true);
  }, []);

  // Search by topic - used in the UI when clicking on topic tags
  const handleTopicSelect = useCallback((topic) => {
    setSelectedTopic(topic);
    setSearchQuery(''); // Clear the search query
    advancedSearch('', { topic });
    setShowTopics(false); // Hide topics after selection
  }, [advancedSearch]);

  // Filter change handlers with immediate search
  const handleGenreChange = (e) => {
    const newGenre = e.target.value;
    setSelectedGenre(newGenre);
    filterCurrentBooks({
      genre: newGenre,
      year: selectedYear,
      rating: selectedRating,
      language: selectedLanguage,
      author: selectedAuthor,
      priceRange: priceRange
    });
  };

  const handleYearChange = (e) => {
    const newYear = e.target.value;
    setSelectedYear(newYear);
    filterCurrentBooks({
      genre: selectedGenre,
      year: newYear,
      rating: selectedRating,
      language: selectedLanguage,
      author: selectedAuthor,
      priceRange: priceRange
    });
  };

  const handleRatingChange = (e) => {
    const newRating = e.target.value;
    setSelectedRating(newRating);
    filterCurrentBooks({
      genre: selectedGenre,
      year: selectedYear,
      rating: newRating,
      language: selectedLanguage,
      author: selectedAuthor,
      priceRange: priceRange
    });
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setSelectedLanguage(newLanguage);
    filterCurrentBooks({
      genre: selectedGenre,
      year: selectedYear,
      rating: selectedRating,
      language: newLanguage,
      author: selectedAuthor,
      priceRange: priceRange
    });
  };

  const handleAuthorChange = (e) => {
    const newAuthor = e.target.value;
    setSelectedAuthor(newAuthor);
    filterCurrentBooks({
      genre: selectedGenre,
      year: selectedYear,
      rating: selectedRating,
      language: selectedLanguage,
      author: newAuthor,
      priceRange: priceRange
    });
  };

  // New function to filter current books without API call
  const filterCurrentBooks = (filters) => {
    // Get the source books (either current books or sample data)
    const sourceBooks = books.length > 0 ? books : BOOKS_DATA;

    const filteredBooks = sourceBooks.filter(book => {
      let matches = true;

      // Genre filter
      if (filters.genre && filters.genre !== 'All Genres') {
        matches = matches && book.genre.toLowerCase().includes(filters.genre.toLowerCase());
      }

      // Year filter
      if (filters.year && filters.year !== 'All Years') {
        matches = matches && book.year === filters.year;
      }

      // Rating filter
      if (filters.rating && filters.rating !== 'All Ratings') {
        const minRating = parseFloat(filters.rating.replace('+', ''));
        matches = matches && book.rating >= minRating;
      }

      // Language filter
      if (filters.language && filters.language !== 'All Languages') {
        matches = matches && book.language.toLowerCase() === filters.language.toLowerCase();
      }

      // Author filter
      if (filters.author && filters.author !== 'All Authors') {
        matches = matches && book.author.toLowerCase().includes(filters.author.toLowerCase());
      }

      // Price range filter
      if (filters.priceRange && filters.priceRange.length === 2) {
        const [minPrice, maxPrice] = filters.priceRange;
        matches = matches && book.price >= minPrice && book.price <= maxPrice;
      }

      return matches;
    });

    setBooks(filteredBooks);
    
    // Update recommendations if we have filtered results
    if (filteredBooks.length > 0) {
      generateRecommendations(filteredBooks);
    }

    // Show appropriate toast message
    if (filteredBooks.length === 0) {
      toast.info('No books match the selected filters');
    } else {
      toast.success(`Found ${filteredBooks.length} matching books`);
    }
  };

  // Update the search effect to use the new filtering system
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        advancedSearch(searchQuery, {
          genre: selectedGenre,
          year: selectedYear,
          minRating: selectedRating !== 'All Ratings' ? selectedRating.replace('+', '') : null,
          language: selectedLanguage,
          priceRange: priceRange,
          author: selectedAuthor
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, advancedSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      advancedSearch(searchQuery, {
        genre: selectedGenre,
        year: selectedYear,
        minRating: selectedRating !== 'All Ratings' ? selectedRating.replace('+', '') : null,
        language: selectedLanguage,
        priceRange: priceRange,
        author: selectedAuthor
      });
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    // Clear selected topic when typing in search box
    if (selectedTopic) {
      setSelectedTopic(null);
    }
  };

  // Handle search history selection
  const handleHistorySelect = (query) => {
    setSearchQuery(query);
    advancedSearch(query, {
      genre: selectedGenre,
      year: selectedYear,
      minRating: selectedRating !== 'All Ratings' ? selectedRating.replace('+', '') : null,
      language: selectedLanguage,
      priceRange: priceRange,
      author: selectedAuthor
    });
    setShowSearchHistory(false);
  };

  // Pagination
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(books.length / booksPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFavorite = (book) => {
    setFavorites(prev => {
      const isFavorite = prev.some(fav => fav.title === book.title);
      if (isFavorite) {
        toast.info('Book removed from favorites');
        return prev.filter(fav => fav.title !== book.title);
      } else {
        toast.success('Book added to favorites');
        return [...prev, book];
      }
    });
  };

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
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Book Recommendations</h1>
          <p className="text-lg text-gray-600">Search millions of books from Google Books</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    placeholder="Search for books by title, author, or ISBN..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    ref={searchInputRef}
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />

                  {/* Search History Dropdown */}
                  {searchHistory.length > 0 && showSearchHistory && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      <div className="p-2 border-b border-gray-200 flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700">Recent Searches</span>
                        <button
                          onClick={() => setShowSearchHistory(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          &times;
                        </button>
                      </div>
                      <ul>
                        {searchHistory.map((query, index) => (
                          <li key={index}>
                            <button
                              onClick={() => handleHistorySelect(query)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center"
                            >
                              <FaHistory className="text-gray-400 mr-2" />
                              {query}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Search History Button */}
                {searchHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowSearchHistory(!showSearchHistory)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <FaHistory className="mr-1" />
                    {showSearchHistory ? 'Hide search history' : 'Show search history'}
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-300"
                >
                  <FaFilter className="mr-2" />
                  Filters
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <FaSearch className="mr-2" />
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4 border-t border-gray-200 mt-4 px-2">
                    {/* Genre Filter */}
                    <div className="px-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                      <select
                        value={selectedGenre}
                        onChange={handleGenreChange}
                        className="custom-select"
                      >
                        {genres.map((genre, index) => (
                          <option key={index} value={genre}>{genre}</option>
                        ))}
                      </select>
                    </div>

                    {/* Year Filter */}
                    <div className="px-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                      <select
                        value={selectedYear}
                        onChange={handleYearChange}
                        className="custom-select"
                      >
                        {years.map((year, index) => (
                          <option key={index} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    {/* Rating Filter */}
                    <div className="px-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <select
                        value={selectedRating}
                        onChange={handleRatingChange}
                        className="custom-select"
                      >
                        {ratings.map((rating, index) => (
                          <option key={index} value={rating}>{rating}</option>
                        ))}
                      </select>
                    </div>

                    {/* Language Filter */}
                    <div className="px-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <select
                        value={selectedLanguage}
                        onChange={handleLanguageChange}
                        className="custom-select"
                      >
                        {languages.map((language, index) => (
                          <option key={index} value={language}>{language}</option>
                        ))}
                      </select>
                    </div>

                    {/* Author Filter */}
                    <div className="px-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                      <select
                        value={selectedAuthor}
                        onChange={handleAuthorChange}
                        className="custom-select"
                      >
                        {authors.map((author, index) => (
                          <option key={index} value={author}>{author}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* Popular Topics Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Popular Topics</h2>
            <button
              onClick={() => setShowTopics(!showTopics)}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <FaTags className="mr-1" />
              {showTopics ? 'Hide topics' : 'Show all topics'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {popularTopics.slice(0, showTopics ? popularTopics.length : 5).map((topic, index) => (
              <button
                key={index}
                onClick={() => handleTopicSelect(topic)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedTopic === topic
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-8">
            <FaExclamationTriangle className="inline-block mr-2" />
            {error}
          </div>
        )}

        {/* Recommendations Section */}
        {showRecommendations && recommendedBooks.length > 0 && !isLoading && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recommended for You</h2>
              <button
                onClick={() => setShowRecommendations(false)}
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <FaChartLine className="mr-1" />
                Hide recommendations
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedBooks.map((book) => (
                <motion.div
                  key={`rec-${book.id}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-blue-50 rounded-lg p-3 flex items-center gap-3 hover:bg-blue-100 transition-colors duration-300"
                >
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-16 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{book.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1">by {book.author}</p>
                    <div className="flex items-center mt-1">
                      <FaStar className="text-yellow-400 mr-1" />
                      <span className="text-sm">{book.rating}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Results Section */}
        {!isLoading && currentBooks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentBooks.map((book) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div className="relative h-48">
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {book.rating > 0 && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-black px-2 py-1 rounded-full text-sm font-semibold flex items-center">
                      <FaStar className="mr-1" />
                      {book.rating}
                    </div>
                  )}
                  <button
                    onClick={() => toggleFavorite(book)}
                    className="absolute top-2 left-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-300"
                  >
                    {favorites.some(fav => fav.title === book.title) ? (
                      <FaHeart className="text-red-500" />
                    ) : (
                      <FaRegHeart className="text-gray-400 hover:text-red-500 transition-colors duration-300" />
                    )}
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">{book.title}</h3>
                  <p className="text-gray-600 mb-2">by {book.author}</p>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-3">{book.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded cursor-pointer hover:bg-blue-200 transition-colors duration-300"
                      onClick={() => handleTopicSelect(book.genre)}
                    >
                      {book.genre}
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      {book.year}
                    </span>
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                      {book.language}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-semibold">
                        {book.price > 0 ? `$${book.price}` : 'Price not available'}
                      </span>
                      {book.buyLink && (
                        <a
                          href={book.buyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors duration-300"
                        >
                          Buy
                        </a>
                      )}
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => openBookReader(book.id)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center transform hover:scale-105"
                      >
                        <FaBook className="mr-1" />
                        Quick Read
                      </button>

                      <button
                        onClick={() => navigate(`/read/${book.id}`)}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors duration-300 flex items-center justify-center transform hover:scale-105"
                      >
                        <FaExternalLinkAlt className="mr-1" />
                        Full Screen
                      </button>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => openBookReader(book.id)}
                        className="flex-1 bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 transition-colors duration-300 flex items-center justify-center transform hover:scale-105"
                      >
                        <FaDownload className="mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-4 py-2 rounded ${
                  currentPage === number
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {number}
              </button>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {!isLoading && books.length === 0 && searchQuery && (
          <div className="text-center py-8">
            <FaInfoCircle className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-gray-600">No books found. Please try a different search term.</p>
          </div>
        )}

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Favorites</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {favorites.map((book) => (
                <motion.div
                  key={`fav-${book.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-50 rounded-lg p-3 flex items-center gap-3 hover:bg-gray-100 transition-colors duration-300"
                >
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{book.title}</h3>
                    <p className="text-xs text-gray-600 line-clamp-1">by {book.author}</p>
                    <button
                      onClick={() => toggleFavorite(book)}
                      className="mt-1 text-xs text-red-600 hover:text-red-800 flex items-center"
                    >
                      <FaHeart className="mr-1" />
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Book Reader Modal */}
      <BookReader
        bookId={selectedBookId}
        isOpen={isReaderOpen}
        onClose={closeBookReader}
      />
    </div>
  );
};

export default BookRecommendation;
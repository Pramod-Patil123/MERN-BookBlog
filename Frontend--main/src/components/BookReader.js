import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaDownload, FaExternalLinkAlt, FaSpinner, FaExclamationTriangle, FaBookOpen, FaExchangeAlt, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import GoogleBooksViewer from './GoogleBooksViewer';
import DirectEmbeddedViewer from './DirectEmbeddedViewer';

// Google Books API key from environment variables
const GOOGLE_BOOKS_API_KEY = process.env.REACT_APP_GOOGLE_BOOKS_API_KEY;

// Helper function to check if API key is valid
const isValidApiKey = (key) => {
  return key && typeof key === 'string' && key.trim() !== '';
};

const BookReader = ({ bookId, isOpen, onClose }) => {
  const [bookData, setBookData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('preview');
  const [viewerType, setViewerType] = useState('direct'); // 'google' or 'direct'
  const [downloadLinks, setDownloadLinks] = useState([]);

  // Fetch detailed book information when component mounts or bookId changes
  useEffect(() => {
    if (!isOpen || !bookId) return;

    const fetchBookDetails = async () => {
      setIsLoading(true);
      setError(null);

      // Check if API key is valid
      if (!isValidApiKey(GOOGLE_BOOKS_API_KEY)) {
        console.error('API Key is missing or invalid');
        setError('API key issue. Unable to load book details. Please check your API key.');
        toast.error('API key issue - Book details unavailable');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch detailed book information from Google Books API
        const response = await axios.get(
          `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${GOOGLE_BOOKS_API_KEY}`,
          { timeout: 10000 }
        );

        if (response.data) {
          setBookData(response.data);

          // Extract download links
          const links = [];

          // Check for PDF availability
          if (response.data.accessInfo?.pdf?.isAvailable) {
            links.push({
              format: 'PDF',
              link: response.data.accessInfo.pdf.acsTokenLink ||
                    response.data.accessInfo.pdf.downloadLink ||
                    response.data.volumeInfo.previewLink
            });
          }

          // Check for EPUB availability
          if (response.data.accessInfo?.epub?.isAvailable) {
            links.push({
              format: 'EPUB',
              link: response.data.accessInfo.epub.acsTokenLink ||
                    response.data.accessInfo.epub.downloadLink ||
                    response.data.volumeInfo.previewLink
            });
          }

          // Add Google Play link if available
          if (response.data.saleInfo?.buyLink) {
            links.push({
              format: 'Google Play',
              link: response.data.saleInfo.buyLink
            });
          }

          // Add direct preview link
          if (response.data.volumeInfo?.previewLink) {
            links.push({
              format: 'Preview',
              link: response.data.volumeInfo.previewLink
            });
          }

          // Add info link
          if (response.data.volumeInfo?.infoLink) {
            links.push({
              format: 'Google Books',
              link: response.data.volumeInfo.infoLink
            });
          }

          // Add web reader link if available
          if (response.data.accessInfo?.webReaderLink) {
            links.push({
              format: 'Web Reader',
              link: response.data.accessInfo.webReaderLink
            });
          }

          setDownloadLinks(links);
        } else {
          setError('Book details not found');
        }
      } catch (error) {
        console.error('Error fetching book details:', error);

        // Check for expired API key specifically
        const errorMessage = error.response?.data?.error?.message || '';
        if (errorMessage.includes('API key expired') ||
            errorMessage.includes('API key not valid') ||
            errorMessage.toLowerCase().includes('expired')) {
          console.warn('API key expired. Using direct viewer as fallback.');
          setViewerType('direct');

          // Create minimal book data for the UI
          setBookData({
            id: bookId,
            volumeInfo: {
              title: 'Book Preview',
              authors: ['Unknown Author'],
              description: 'Book details could not be loaded due to API key issues. Using direct preview instead.',
              imageLinks: {
                thumbnail: `https://books.google.com/books/content?id=${bookId}&printsec=frontcover&img=1&zoom=1&source=gbs_api`
              }
            }
          });

          // Add direct links that don't require API key
          setDownloadLinks([
            {
              format: 'Google Books',
              link: `https://books.google.com/books?id=${bookId}`
            },
            {
              format: 'Preview',
              link: `https://books.google.com/books?id=${bookId}&printsec=frontcover`
            }
          ]);

          setError(null); // Clear error since we have a fallback
          setIsLoading(false);
        } else if (error.response?.status === 403) {
          console.warn('API key is invalid. Using direct viewer as fallback.');
          setViewerType('direct');

          // Create minimal book data for the UI
          setBookData({
            id: bookId,
            volumeInfo: {
              title: 'Book Preview',
              authors: ['Unknown Author'],
              description: 'Book details could not be loaded due to API key issues. Using direct preview instead.',
              imageLinks: {
                thumbnail: `https://books.google.com/books/content?id=${bookId}&printsec=frontcover&img=1&zoom=1&source=gbs_api`
              }
            }
          });

          // Add direct links that don't require API key
          setDownloadLinks([
            {
              format: 'Google Books',
              link: `https://books.google.com/books?id=${bookId}`
            },
            {
              format: 'Preview',
              link: `https://books.google.com/books?id=${bookId}&printsec=frontcover`
            }
          ]);

          setError(null); // Clear error since we have a fallback
          setIsLoading(false);
        } else {
          console.error('Failed to load book details:', error);
          setViewerType('direct'); // Fallback to direct viewer
          setError('Failed to load detailed book information. Using basic preview instead.');
          toast.error('Using basic preview mode', { autoClose: 3000 });
          setIsLoading(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookId, isOpen]);

  // Handle download options
  const handleDownload = (downloadLink, format) => {
    if (downloadLink) {
      window.open(downloadLink, '_blank');
      toast.success(`Downloading book in ${format} format`);
    } else {
      toast.error('Download link not available');
    }
  };

  // Get available download formats - now using the pre-extracted links
  const getDownloadOptions = () => {
    return downloadLinks;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <FaBookOpen className="mr-2 text-blue-600" />
                {isLoading ? 'Loading Book...' : bookData?.volumeInfo?.title || 'Book Reader'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'preview'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  onClick={() => setActiveTab('preview')}
                >
                  Preview
                </button>
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'info'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  onClick={() => setActiveTab('info')}
                >
                  Book Info
                </button>
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === 'download'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  onClick={() => setActiveTab('download')}
                >
                  Download
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-auto p-4">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
                    <p className="text-gray-600">Loading book details...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <FaExclamationTriangle className="text-4xl text-red-500 mb-4" />
                    <p className="text-gray-800 font-medium mb-2">Error Loading Book</p>
                    <p className="text-gray-600">{error}</p>
                  </div>
                ) : (
                  <>
                    {/* Preview Tab */}
                    {activeTab === 'preview' && (
                      <div className="h-full flex flex-col">
                        {/* Viewer Type Toggle */}
                        <div className="flex justify-end mb-2">
                          <div className="inline-flex rounded-md shadow-sm" role="group">
                            <button
                              type="button"
                              onClick={() => setViewerType('direct')}
                              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                                viewerType === 'direct'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-100'
                              } border border-gray-200`}
                            >
                              Direct Viewer
                            </button>
                            <button
                              type="button"
                              onClick={() => setViewerType('google')}
                              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                                viewerType === 'google'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white text-gray-700 hover:bg-gray-100'
                              } border border-gray-200`}
                            >
                              Google Viewer
                            </button>
                          </div>
                        </div>

                        {/* Viewer Component */}
                        <div className="flex-1">
                          {viewerType === 'google' ? (
                            <GoogleBooksViewer
                              bookId={bookId}
                              isbn={bookData?.volumeInfo?.industryIdentifiers?.[0]?.identifier}
                            />
                          ) : (
                            <DirectEmbeddedViewer
                              bookId={bookId}
                              isbn={bookData?.volumeInfo?.industryIdentifiers?.[0]?.identifier}
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Info Tab */}
                    {activeTab === 'info' && (
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3">
                          <img
                            src={bookData?.volumeInfo?.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=No+Cover'}
                            alt={bookData?.volumeInfo?.title}
                            className="w-full rounded shadow-md"
                          />
                        </div>
                        <div className="md:w-2/3">
                          <h3 className="text-xl font-semibold mb-2">{bookData?.volumeInfo?.title}</h3>
                          <p className="text-gray-600 mb-4">by {bookData?.volumeInfo?.authors?.join(', ') || 'Unknown Author'}</p>

                          <div className="mb-4">
                            <h4 className="font-medium text-gray-800 mb-1">Description</h4>
                            <div
                              className="text-gray-600"
                              dangerouslySetInnerHTML={{ __html: bookData?.volumeInfo?.description || 'No description available' }}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-800 mb-1">Publisher</h4>
                              <p className="text-gray-600">{bookData?.volumeInfo?.publisher || 'Unknown'}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800 mb-1">Published Date</h4>
                              <p className="text-gray-600">{bookData?.volumeInfo?.publishedDate || 'Unknown'}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800 mb-1">Pages</h4>
                              <p className="text-gray-600">{bookData?.volumeInfo?.pageCount || 'Unknown'}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800 mb-1">Categories</h4>
                              <p className="text-gray-600">{bookData?.volumeInfo?.categories?.join(', ') || 'Uncategorized'}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800 mb-1">Language</h4>
                              <p className="text-gray-600">{bookData?.volumeInfo?.language || 'Unknown'}</p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800 mb-1">ISBN</h4>
                              <p className="text-gray-600">
                                {bookData?.volumeInfo?.industryIdentifiers?.[0]?.identifier || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Download Tab */}
                    {activeTab === 'download' && (
                      <div className="flex flex-col items-center">
                        <h3 className="text-xl font-semibold mb-6">Download & Access Options</h3>

                        {getDownloadOptions().length > 0 ? (
                          <div className="w-full max-w-2xl">
                            <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm text-blue-800">
                              <p className="mb-2"><strong>Note:</strong> Download availability depends on the book's copyright status and publisher restrictions.</p>
                              <p>Some options may redirect to Google Books where you can access the book according to its availability.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {getDownloadOptions().map((option, index) => {
                                // Determine button style based on format
                                let buttonClass = "bg-blue-600 hover:bg-blue-700"; // Default
                                let icon = <FaDownload className="mr-2" />;

                                if (option.format === 'Google Books' || option.format === 'Preview') {
                                  buttonClass = "bg-green-600 hover:bg-green-700";
                                  icon = <FaExternalLinkAlt className="mr-2" />;
                                } else if (option.format === 'Web Reader') {
                                  buttonClass = "bg-purple-600 hover:bg-purple-700";
                                  icon = <FaBookOpen className="mr-2" />;
                                }

                                return (
                                  <a
                                    key={index}
                                    href={option.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center justify-center gap-2 px-4 py-3 ${buttonClass} text-white rounded-lg transition-colors`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleDownload(option.link, option.format);
                                    }}
                                  >
                                    {icon}
                                    {option.format === 'Google Books' ? 'View on Google Books' :
                                     option.format === 'Preview' ? 'Open Preview' :
                                     `Download ${option.format}`}
                                  </a>
                                );
                              })}
                            </div>

                            {/* Direct Google Books Link */}
                            <div className="mt-8 text-center">
                              <p className="text-gray-600 mb-4">
                                Can't find what you need? Try searching for this book directly:
                              </p>
                              <a
                                href={`https://www.google.com/search?tbm=bks&q=${encodeURIComponent(bookData?.volumeInfo?.title || 'book')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                              >
                                <FaSearch className="mr-2" />
                                Search on Google Books
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <FaExclamationTriangle className="text-4xl text-yellow-500 mb-4 mx-auto" />
                            <p className="text-gray-800 font-medium mb-2">No Download Options Available</p>
                            <p className="text-gray-600 mb-4">
                              This book doesn't have downloadable formats available.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                              <a
                                href={`https://books.google.com/books?id=${bookId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                <FaExternalLinkAlt className="mr-2" />
                                View on Google Books
                              </a>
                              <a
                                href={`https://www.google.com/search?tbm=bks&q=${encodeURIComponent(bookData?.volumeInfo?.title || 'book')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                              >
                                <FaSearch className="mr-2" />
                                Search on Google Books
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookReader;

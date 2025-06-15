import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSpinner, FaExclamationTriangle, FaDownload, FaExternalLinkAlt } from 'react-icons/fa';
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

const FullScreenReader = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [bookData, setBookData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewerType, setViewerType] = useState('direct'); // 'google' or 'direct'
  const [downloadLinks, setDownloadLinks] = useState([]);

  // Fetch book details when component mounts
  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!bookId) {
        setError('No book ID provided');
        setIsLoading(false);
        return;
      }

      // Check if API key is valid
      if (!isValidApiKey(GOOGLE_BOOKS_API_KEY)) {
        setError('API key is missing or invalid');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `https://www.googleapis.com/books/v1/volumes/${bookId}?key=${GOOGLE_BOOKS_API_KEY}`,
          { timeout: 10000 }
        );

        if (response.data) {
          setBookData(response.data);
          document.title = `Reading: ${response.data.volumeInfo?.title || 'Book'}`;

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

          document.title = `Reading Book`;
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

          document.title = `Reading Book`;
          setError(null); // Clear error since we have a fallback
          setIsLoading(false);
        } else {
          console.error('Failed to load book details:', error);
          setViewerType('direct'); // Fallback to direct viewer

          // Create minimal book data for the UI
          setBookData({
            id: bookId,
            volumeInfo: {
              title: 'Book Preview',
              authors: ['Unknown Author'],
              description: 'Book details could not be loaded. Using basic preview instead.',
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
            }
          ]);

          document.title = `Reading Book`;
          setError('Failed to load detailed book information. Using basic preview instead.');
          toast.error('Using basic preview mode', { autoClose: 3000 });
          setIsLoading(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookId]);

  // Get available download formats
  const getDownloadOptions = () => {
    if (!bookData || !bookData.accessInfo) return [];

    const options = [];
    const { accessInfo } = bookData;

    if (accessInfo.pdf && accessInfo.pdf.isAvailable) {
      options.push({
        format: 'PDF',
        link: accessInfo.pdf.acsTokenLink || bookData.volumeInfo.previewLink
      });
    }

    if (accessInfo.epub && accessInfo.epub.isAvailable) {
      options.push({
        format: 'EPUB',
        link: accessInfo.epub.acsTokenLink || bookData.volumeInfo.previewLink
      });
    }

    // Add Google Play link if available
    if (bookData.saleInfo && bookData.saleInfo.buyLink) {
      options.push({
        format: 'Google Play',
        link: bookData.saleInfo.buyLink
      });
    }

    return options;
  };

  // Handle download options
  const handleDownload = (downloadLink, format) => {
    if (downloadLink) {
      window.open(downloadLink, '_blank');
      toast.success(`Downloading book in ${format} format`);
    } else {
      toast.error('Download link not available');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 truncate">
              {isLoading ? 'Loading...' : bookData?.volumeInfo?.title || 'Book Reader'}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            {downloadLinks.length > 0 ? (
              <>
                <div className="relative group">
                  <button
                    className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <FaDownload className="mr-1" />
                    Download
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden group-hover:block">
                    <div className="py-1">
                      {downloadLinks.map((option, index) => {
                        // Skip certain formats from dropdown
                        if (option.format === 'Google Books' || option.format === 'Preview') {
                          return null;
                        }

                        return (
                          <a
                            key={index}
                            href={option.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDownload(option.link, option.format);
                            }}
                          >
                            {option.format}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {downloadLinks.some(link => link.format === 'Google Books') && (
                  <a
                    href={downloadLinks.find(link => link.format === 'Google Books')?.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    <FaExternalLinkAlt className="mr-1" />
                    Google Books
                  </a>
                )}
              </>
            ) : (
              <a
                href={`https://books.google.com/books?id=${bookId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                <FaExternalLinkAlt className="mr-1" />
                Google Books
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-4">
        <div className="max-w-7xl mx-auto h-full bg-white rounded-lg shadow-md overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <FaSpinner className="animate-spin text-4xl text-blue-600 mr-2" />
              <p className="text-gray-600">Loading book...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <FaExclamationTriangle className="text-5xl text-red-500 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">Error Loading Book</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Go Back
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Viewer Type Toggle */}
              <div className="flex justify-end mb-2 p-2 bg-white">
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
        </div>
      </main>
    </div>
  );
};

export default FullScreenReader;

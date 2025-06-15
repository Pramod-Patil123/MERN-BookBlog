import React, { useEffect, useRef, useState } from 'react';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

const GoogleBooksViewer = ({ bookId, isbn }) => {
  const viewerCanvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewerLoaded, setViewerLoaded] = useState(false);

  useEffect(() => {
    // Load the Google Books API script
    const loadGoogleBooksAPI = () => {
      // Clear any existing scripts to avoid conflicts
      const existingScript = document.getElementById('google-books-api');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }

      // Check if API is already loaded
      if (window.google && window.google.books) {
        console.log('Google Books API already loaded');
        initializeViewer();
        return;
      }

      console.log('Loading Google Books API script...');
      const script = document.createElement('script');
      script.id = 'google-books-api';
      script.src = 'https://www.google.com/books/jsapi.js';
      script.async = true;
      script.onload = () => {
        console.log('Google Books API script loaded successfully');
        if (window.google && window.google.books) {
          try {
            window.google.books.load();
            window.google.books.setOnLoadCallback(() => {
              console.log('Google Books API initialized');
              initializeViewer();
            });
          } catch (err) {
            console.error('Error initializing Google Books API:', err);
            setError('Failed to initialize Google Books API');
            setIsLoading(false);
          }
        } else {
          console.error('Google Books API not available after script load');
          setError('Failed to load Google Books API');
          setIsLoading(false);
        }
      };
      script.onerror = (err) => {
        console.error('Failed to load Google Books API script:', err);
        setError('Failed to load Google Books API script');
        setIsLoading(false);
      };
      document.body.appendChild(script);

      return () => {
        // Don't remove the script on unmount to avoid reloading issues
        // Just clean up any event listeners if needed
      };
    };

    // Initialize the viewer with the book ID or ISBN
    const initializeViewer = () => {
      try {
        if (!viewerCanvasRef.current) {
          console.error('Viewer canvas ref is not available');
          setError('Viewer element not found');
          setIsLoading(false);
          return;
        }

        console.log('Initializing viewer with ID:', bookId || `ISBN:${isbn}`);

        // Create the viewer instance
        const viewer = new window.google.books.DefaultViewer(viewerCanvasRef.current);

        // Set up viewer callbacks and options
        viewer.setUiOptions({
          showLinkLabel: false,
          showEmbedLabel: false,
          showShareLabel: false
        });

        // Determine what to load
        let identifier = '';
        if (bookId) {
          identifier = bookId;
          console.log('Loading by book ID:', bookId);
        } else if (isbn) {
          identifier = `ISBN:${isbn}`;
          console.log('Loading by ISBN:', isbn);
        } else {
          setError('No book ID or ISBN provided');
          setIsLoading(false);
          return;
        }

        // Load the book
        viewer.load(
          identifier,
          () => {
            // Success callback
            console.log('Book loaded successfully');
            setIsLoading(false);
            setViewerLoaded(true);
          },
          (errorCode) => {
            // Error callback
            console.error('Error loading book:', errorCode);
            let errorMessage = 'This book is not available for preview';

            // Provide more specific error messages based on error code
            if (errorCode === 'not found') {
              errorMessage = 'Book not found. It may have been removed or is not available in this region.';
            } else if (errorCode === 'not available') {
              errorMessage = 'This book is not available for preview due to copyright restrictions.';
            } else if (errorCode === 'not embeddable') {
              errorMessage = 'This book cannot be embedded in this application.';
            }

            setError(errorMessage);
            setIsLoading(false);
          }
        );
      } catch (err) {
        console.error('Error initializing Google Books viewer:', err);
        setError('Failed to initialize book viewer: ' + (err.message || 'Unknown error'));
        setIsLoading(false);
      }
    };

    loadGoogleBooksAPI();
  }, [bookId, isbn]);

  return (
    <div className="w-full h-full flex flex-col">
      {isLoading && (
        <div className="flex-1 flex items-center justify-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
          <p className="text-gray-600 ml-2">Loading book viewer...</p>
        </div>
      )}

      {error && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <FaExclamationTriangle className="text-4xl text-yellow-500 mb-4" />
          <p className="text-gray-800 font-medium mb-2">Preview Not Available</p>
          <p className="text-gray-600">{error}</p>
        </div>
      )}

      <div
        ref={viewerCanvasRef}
        className={`w-full h-full ${isLoading || error ? 'hidden' : ''}`}
      ></div>
    </div>
  );
};

export default GoogleBooksViewer;

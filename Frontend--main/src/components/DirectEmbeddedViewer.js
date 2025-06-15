import React, { useState, useEffect, useRef } from 'react';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

const DirectEmbeddedViewer = ({ bookId, isbn }) => {
  const iframeRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Create a direct embedded viewer using an iframe
    const setupDirectViewer = () => {
      if (!iframeRef.current) return;

      try {
        setIsLoading(true);

        // Determine the identifier to use
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

        // Create the direct embedded viewer URL
        const viewerUrl = `https://www.google.com/books/edition/${identifier}?hl=en&gbpv=1&output=embed`;

        // Set the iframe src
        iframeRef.current.src = viewerUrl;

        // Handle iframe load events
        iframeRef.current.onload = () => {
          console.log('Iframe loaded');
          setIsLoading(false);
        };

        // Handle iframe errors
        iframeRef.current.onerror = (err) => {
          console.error('Iframe error:', err);
          setError('Failed to load book preview');
          setIsLoading(false);
        };
      } catch (err) {
        console.error('Error setting up direct viewer:', err);
        setError('Failed to initialize book viewer: ' + (err.message || 'Unknown error'));
        setIsLoading(false);
      }
    };

    setupDirectViewer();
  }, [bookId, isbn]);

  return (
    <div className="w-full h-full flex flex-col relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <div className="flex flex-col items-center">
            <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
            <p className="text-gray-600">Loading book preview...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
          <FaExclamationTriangle className="text-4xl text-yellow-500 mb-4" />
          <p className="text-gray-800 font-medium mb-2">Preview Not Available</p>
          <p className="text-gray-600">{error}</p>
        </div>
      )}

      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        title="Book Preview"
        allowFullScreen
        allow="encrypted-media"
        onError={() => {
          setError('Failed to load book preview');
          setIsLoading(false);
        }}
      ></iframe>
    </div>
  );
};

export default DirectEmbeddedViewer;

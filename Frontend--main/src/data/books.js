// Book data from Kaggle dataset - Enhanced for better fallback experience
export const BOOKS_DATA = [
  {
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    description: "Rich Dad Poor Dad is a 1997 book written by Robert Kiyosaki and Sharon Lechter. It advocates the importance of financial literacy, financial independence and building wealth through investing in assets, real estate investing, starting and owning businesses, as well as increasing one's financial intelligence.",
    rating: 4.7,
    genre: "Personal Finance",
    year: "1997",
    benefits: "Teaches financial literacy, investment strategies, and wealth-building principles.",
    imageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500",
    isbn: "9781612680019",
    publisher: "Warner Books",
    language: "English",
    pages: 336,
    price: 14.99
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description: "A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.",
    rating: 4.5,
    genre: "Fiction",
    year: "1925",
    benefits: "Explores themes of the American Dream, wealth, and social class.",
    imageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500",
    isbn: "9780743273565",
    publisher: "Scribner",
    language: "English",
    pages: 180,
    price: 9.99
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    description: "The story of racial injustice and the loss of innocence in the American South.",
    rating: 4.8,
    genre: "Fiction",
    year: "1960",
    benefits: "Teaches important lessons about justice, prejudice, and moral growth.",
    imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500",
    isbn: "9780446310789",
    publisher: "Grand Central Publishing",
    language: "English",
    pages: 281,
    price: 12.99
  },
  {
    title: "1984",
    author: "George Orwell",
    description: "A dystopian novel set in a totalitarian society where critical thought is suppressed.",
    rating: 4.6,
    genre: "Science Fiction",
    year: "1949",
    benefits: "Provides insights into surveillance, propaganda, and totalitarian control.",
    imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500",
    isbn: "9780451524935",
    publisher: "Signet Classic",
    language: "English",
    pages: 328,
    price: 8.99
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    description: "A romantic novel of manners that follows the main character Elizabeth Bennet.",
    rating: 4.7,
    genre: "Romance",
    year: "1813",
    benefits: "Explores themes of love, marriage, and social class in Georgian-era England.",
    imageUrl: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=500",
    isbn: "9780141439518",
    publisher: "Penguin Classics",
    language: "English",
    pages: 432,
    price: 7.99
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    description: "The story of teenage alienation and loss of innocence in the 1950s.",
    rating: 4.4,
    genre: "Fiction",
    year: "1951",
    benefits: "Provides insights into teenage psychology and societal expectations.",
    imageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500",
    isbn: "9780316769488",
    publisher: "Little, Brown and Company",
    language: "English",
    pages: 277,
    price: 10.99
  },
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    description: "The first novel in the Harry Potter series, featuring a young wizard's journey at Hogwarts School of Witchcraft and Wizardry.",
    rating: 4.9,
    genre: "Fantasy",
    year: "1997",
    benefits: "Introduces readers to a magical world of adventure and friendship.",
    imageUrl: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=500",
    isbn: "9780590353427",
    publisher: "Scholastic",
    language: "English",
    pages: 309,
    price: 12.99,
    previewLink: "https://books.google.com/books?id=wrOQLV6xB-wC&printsec=frontcover"
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    description: "A philosophical novel about a young Andalusian shepherd who dreams of finding a worldly treasure and embarks on a journey of self-discovery.",
    rating: 4.6,
    genre: "Fiction",
    year: "1988",
    benefits: "Teaches about following one's dreams and finding one's destiny.",
    imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500",
    isbn: "9780062315007",
    publisher: "HarperOne",
    language: "English",
    pages: 208,
    price: 11.99,
    previewLink: "https://books.google.com/books?id=FzVjBgAAQBAJ&printsec=frontcover"
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    description: "A book that explores the history of the human species from the emergence of Homo sapiens to the present day.",
    rating: 4.7,
    genre: "History",
    year: "2011",
    benefits: "Provides a comprehensive overview of human history and evolution.",
    imageUrl: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=500",
    isbn: "9780062316097",
    publisher: "Harper",
    language: "English",
    pages: 443,
    price: 14.99,
    previewLink: "https://books.google.com/books?id=1EiJAwAAQBAJ&printsec=frontcover"
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    description: "A guide to building good habits and breaking bad ones through small, incremental changes.",
    rating: 4.8,
    genre: "Self-Help",
    year: "2018",
    benefits: "Provides practical strategies for habit formation and personal improvement.",
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500",
    isbn: "9780735211292",
    publisher: "Avery",
    language: "English",
    pages: 320,
    price: 16.99,
    previewLink: "https://books.google.com/books?id=XfFvDwAAQBAJ&printsec=frontcover"
  },
  {
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    description: "An epic high-fantasy novel that follows the quest to destroy the One Ring, which was created by the Dark Lord Sauron.",
    rating: 4.9,
    genre: "Fantasy",
    year: "1954",
    benefits: "Immerses readers in a richly detailed fantasy world with complex characters and themes.",
    imageUrl: "https://images.unsplash.com/photo-1506466010722-395aa2bef877?w=500",
    isbn: "9780618640157",
    publisher: "Houghton Mifflin",
    language: "English",
    pages: 1178,
    price: 19.99,
    previewLink: "https://books.google.com/books?id=yl4dILkcqm4C&printsec=frontcover"
  }
];

// Helper functions for data manipulation
export const getBooksByGenre = (genre) => {
  return BOOKS_DATA.filter(book => book.genre.toLowerCase() === genre.toLowerCase());
};

export const getBooksByAuthor = (author) => {
  return BOOKS_DATA.filter(book => book.author.toLowerCase().includes(author.toLowerCase()));
};

export const getBooksByYear = (year) => {
  return BOOKS_DATA.filter(book => book.year === year);
};

export const getBooksByRating = (minRating) => {
  return BOOKS_DATA.filter(book => book.rating >= minRating);
};

export const searchBooks = (query) => {
  if (!query) return BOOKS_DATA;

  const searchTerm = query.toLowerCase().trim();
  console.log('Searching for:', searchTerm); // Debug log

  const results = BOOKS_DATA.filter(book => {
    const titleMatch = book.title.toLowerCase().includes(searchTerm);
    const authorMatch = book.author.toLowerCase().includes(searchTerm);
    const genreMatch = book.genre.toLowerCase().includes(searchTerm);
    const descriptionMatch = book.description.toLowerCase().includes(searchTerm);
    const isbnMatch = book.isbn.includes(searchTerm);
    const publisherMatch = book.publisher.toLowerCase().includes(searchTerm);

    const isMatch = titleMatch || authorMatch || genreMatch || descriptionMatch || isbnMatch || publisherMatch;

    if (isMatch) {
      console.log('Found match:', book.title); // Debug log
    }

    return isMatch;
  });

  console.log('Total matches found:', results.length); // Debug log
  return results;
};
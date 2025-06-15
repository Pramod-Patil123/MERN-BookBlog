import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Rating,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from '@mui/material';

const AddBookReviewForm = ({ books = [], onSubmit }) => {
  const [bookId, setBookId] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!bookId || rating === 0 || comment.trim() === '') {
      alert('Please select a book, give a rating, and enter a comment.');
      return;
    }

    const review = {
      bookId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    // Simulate Redux/API submission
    if (onSubmit) onSubmit(review);

    // Reset form
    setBookId('');
    setRating(0);
    setComment('');
    setSuccess(true);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Submit a Book Review
      </Typography>

      {/* Book Selector */}
      <FormControl fullWidth margin="normal" required>
        <InputLabel>Select Book</InputLabel>
        <Select
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          label="Select Book"
        >
          {books.map((book) => (
            <MenuItem key={book.id} value={book.id}>
              {book.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Rating */}
      <Typography component="legend">Your Rating (1–5)</Typography>
      <Rating
        name="book-rating"
        value={rating}
        onChange={(event, newValue) => setRating(newValue)}
      />

      {/* Comment */}
      <TextField
        label="Your Thoughts on the Book"
        multiline
        rows={4}
        fullWidth
        margin="normal"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
      />

      {/* Submit Button */}
      <Button type="submit" variant="contained" color="primary">
        Submit Review
      </Button>

      {/* Success Message */}
      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Review submitted successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddBookReviewForm;

import pandas as pd
import json
import os
import requests
from io import StringIO

def download_and_convert_dataset():
    try:
        # Download the dataset directly from Kaggle
        print("Downloading dataset...")
        url = "https://raw.githubusercontent.com/saurabhbagchi/books-dataset/main/books.csv"
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for bad status codes
        
        # Read the CSV data
        df = pd.read_csv(StringIO(response.text))
        
        # Convert to JSON format
        print("Converting to JSON...")
        books_data = []
        
        for _, row in df.iterrows():
            book = {
                "title": row.get('title', ''),
                "author": row.get('authors', ''),
                "description": row.get('description', ''),
                "rating": float(row.get('average_rating', 0)),
                "genre": row.get('categories', 'Fiction'),
                "year": str(row.get('published_date', '')).split('-')[0] if pd.notna(row.get('published_date')) else 'Unknown',
                "benefits": row.get('description', '')[:200] + '...' if pd.notna(row.get('description')) else 'No benefits listed',
                "imageUrl": row.get('image_url', ''),
                "isbn": str(row.get('isbn', '')),
                "publisher": row.get('publisher', 'Unknown'),
                "language": row.get('language_code', 'English'),
                "pages": int(row.get('num_pages', 0)),
                "price": float(row.get('price', 0))
            }
            books_data.append(book)
        
        # Create src/data directory if it doesn't exist
        os.makedirs('src/data', exist_ok=True)
        
        # Save to JSON file
        output_file = 'src/data/books.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(books_data, f, indent=2, ensure_ascii=False)
        
        print(f"Successfully converted and saved {len(books_data)} books to {output_file}")
        return True
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    download_and_convert_dataset() 
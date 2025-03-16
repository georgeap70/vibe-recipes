# Recipe Finder Application

A web application that helps users find recipes based on available ingredients and meal preferences. The application uses TheMealDB's free API to search through thousands of recipes.

## Features

- Search recipes by ingredients
- Filter by meal types (Breakfast, Chicken, Seafood, Vegan, etc.)
- View detailed recipe instructions
- See recipe origin and category
- Beautiful, responsive UI
- Recipe images and ingredient lists

## Tech Stack

- Frontend: React with TypeScript and Chakra UI
- Backend: Python Flask
- API: TheMealDB (free, no API key required)

## Prerequisites

- Node.js (v18 or higher)
- Python 3.8 or higher
- npm or yarn

## Setup and Running

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a Python virtual environment:
```bash
# On macOS/Linux
python3 -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
.\venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Start the Flask server:
```bash
python app.py
```

The backend server will start at `http://localhost:5000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Using the Application

1. Make sure both backend and frontend servers are running
2. Open your browser and navigate to `http://localhost:5173`
3. Enter ingredients in the input field (e.g., chicken, rice, tomato)
4. Optionally select meal types to filter results
5. Click "Search Recipes" to find matching recipes
6. View detailed recipes with:
   - Full ingredient lists with measurements
   - Step-by-step cooking instructions
   - Recipe origin and category
   - Recipe images

## API Documentation

The backend exposes the following endpoint:

- `POST /api/recipes`
  - Request body:
    ```json
    {
      "ingredients": ["ingredient1", "ingredient2"],
      "preferences": ["Chicken", "Seafood"]
    }
    ```
  - Response: Array of recipe objects with details

## Troubleshooting

1. If you see no results:
   - Make sure to use common ingredient names (e.g., "chicken" instead of "chicken breast")
   - Try searching with a single ingredient first
   - Check if both frontend and backend servers are running

2. If you can't connect to the backend:
   - Verify the Flask server is running on port 5000
   - Check for any error messages in the terminal
   - Make sure no other application is using port 5000

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 
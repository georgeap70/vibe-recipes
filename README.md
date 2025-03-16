# Recipe Finder Application

A web application that helps users find recipes based on available ingredients and dietary preferences.

## Features

- Input multiple ingredients
- Select dietary preferences
- Get recipe suggestions with detailed instructions
- Modern, responsive UI

## Tech Stack

- Frontend: React with TypeScript and Chakra UI
- Backend: Python Flask
- API: Spoonacular Recipe API

## Setup

### Prerequisites

- Node.js (v18 or higher)
- Python 3.8 or higher
- npm or yarn
- A Spoonacular API key (get one at [Spoonacular's website](https://spoonacular.com/food-api))

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory and add your Spoonacular API key:
```
SPOONACULAR_API_KEY=your_api_key_here
```

5. Start the backend server:
```bash
python app.py
```

### Frontend Setup

1. Navigate to the frontend directory:
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

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Enter ingredients in the input field and press Enter or click Add
3. Select any dietary preferences from the dropdown
4. Click "Search Recipes" to get recipe suggestions
5. View detailed recipes with ingredients and instructions

## API Documentation

The backend exposes the following endpoint:

- `POST /api/recipes`
  - Request body:
    ```json
    {
      "ingredients": ["ingredient1", "ingredient2"],
      "preferences": ["vegetarian", "gluten-free"]
    }
    ```
  - Response: Array of recipe objects with details

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 
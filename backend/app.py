from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Spoonacular API configuration
SPOONACULAR_API_KEY = os.getenv('SPOONACULAR_API_KEY')
SPOONACULAR_BASE_URL = 'https://api.spoonacular.com'

@app.route('/api/recipes', methods=['POST'])
def get_recipes():
    try:
        data = request.json
        ingredients = data.get('ingredients', [])
        dietary_preferences = data.get('preferences', [])
        
        # Convert ingredients list to comma-separated string
        ingredients_str = ','.join(ingredients)
        
        # Build query parameters
        params = {
            'apiKey': SPOONACULAR_API_KEY,
            'ingredients': ingredients_str,
            'number': 3,  # Number of recipes to return
            'ranking': 2,  # Maximize used ingredients
            'ignorePantry': True  # Ignore common ingredients like salt, oil
        }
        
        # Add dietary preferences if provided
        if dietary_preferences:
            params['diet'] = ','.join(dietary_preferences)
        
        # Get recipes that match ingredients
        response = requests.get(
            f'{SPOONACULAR_BASE_URL}/recipes/findByIngredients',
            params=params
        )
        recipes = response.json()
        
        # Get detailed information for each recipe
        detailed_recipes = []
        for recipe in recipes:
            recipe_id = recipe['id']
            detail_response = requests.get(
                f'{SPOONACULAR_BASE_URL}/recipes/{recipe_id}/information',
                params={'apiKey': SPOONACULAR_API_KEY}
            )
            detailed_recipes.append(detail_response.json())
        
        return jsonify(detailed_recipes)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

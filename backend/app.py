from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import requests
import logging

# Configure logging - for production, INFO level is recommended.
# Consider making the log level configurable e.g. via an environment variable:
# import os
# log_level = os.environ.get('LOG_LEVEL', 'INFO').upper()
# logging.basicConfig(level=log_level)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# Enable CORS for all routes and all origins.
# For a production environment where the frontend has a specific domain,
# it's recommended to restrict origins, for example:
# from flask_cors import CORS
# CORS(app, resources={r"/api/*": {"origins": ["https://your-frontend-domain.com", "http://localhost:3000"]}})
# Initialize CORS after other app configurations
CORS(app)

# Initialize Flask-Limiter
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour", "5 per minute"],
    storage_uri="memory://", # Use "memory://" for in-process, or e.g. "redis://localhost:6379" for distributed
)

# TheMealDB API configuration
MEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1'

@app.route('/api/recipes', methods=['POST'])
@limiter.limit("10 per minute") # Specific limit for this route
def get_recipes():
    try:
        data = request.json
        ingredients = data.get('ingredients', [])
        dietary_preferences = data.get('preferences', [])

        MAX_INGREDIENTS = 20
        MAX_INGREDIENT_LENGTH = 100
        MAX_PREFERENCES = 10
        MAX_PREFERENCE_LENGTH = 50

        if not isinstance(ingredients, list):
            logger.warning("Invalid type for ingredients.")
            return jsonify({'error': 'Invalid input: ingredients must be a list.'}), 400
        
        if len(ingredients) > MAX_INGREDIENTS:
            logger.warning(f"Too many ingredients: {len(ingredients)}")
            return jsonify({'error': f'Invalid input: Maximum number of ingredients is {MAX_INGREDIENTS}.'}), 400
        
        for ingredient in ingredients:
            if not isinstance(ingredient, str):
                logger.warning(f"Invalid type for ingredient: {type(ingredient)}")
                return jsonify({'error': 'Invalid input: each ingredient must be a string.'}), 400
            if len(ingredient) > MAX_INGREDIENT_LENGTH:
                logger.warning(f"Ingredient too long: {len(ingredient)}")
                return jsonify({'error': f'Invalid input: Ingredient length cannot exceed {MAX_INGREDIENT_LENGTH} characters.'}), 400

        if not isinstance(dietary_preferences, list):
            logger.warning("Invalid type for preferences.")
            return jsonify({'error': 'Invalid input: preferences must be a list.'}), 400

        if len(dietary_preferences) > MAX_PREFERENCES:
            logger.warning(f"Too many preferences: {len(dietary_preferences)}")
            return jsonify({'error': f'Invalid input: Maximum number of preferences is {MAX_PREFERENCES}.'}), 400

        for preference in dietary_preferences:
            if not isinstance(preference, str):
                logger.warning(f"Invalid type for preference: {type(preference)}")
                return jsonify({'error': 'Invalid input: each preference must be a string.'}), 400
            if len(preference) > MAX_PREFERENCE_LENGTH:
                logger.warning(f"Preference too long: {len(preference)}")
                return jsonify({'error': f'Invalid input: Preference length cannot exceed {MAX_PREFERENCE_LENGTH} characters.'}), 400
        
        logger.debug(f"Received request with ingredients: {ingredients}, preferences: {dietary_preferences}")
        
        recipes = []
        # First try to search by ingredient
        for ingredient in ingredients:
            # Replace spaces with underscores for the API
            formatted_ingredient = ingredient.strip().replace(' ', '_').lower()
            logger.debug(f"Searching for ingredient: {formatted_ingredient}")
            
            response = requests.get(
                f'{MEALDB_BASE_URL}/filter.php',
                params={'i': formatted_ingredient}
            )
            logger.debug(f"API Response status: {response.status_code}")
            logger.debug(f"API Response content: {response.text[:200]}")  # Log first 200 chars
            
            if response.status_code == 200:
                meals = response.json().get('meals')
                if meals:
                    logger.debug(f"Found {len(meals)} meals for ingredient {formatted_ingredient}")
                    # Get detailed information for each recipe
                    for meal in meals[:3]:  # Limit to 3 recipes per ingredient
                        meal_id = meal['idMeal']
                        logger.debug(f"Getting details for meal ID: {meal_id}")
                        
                        detail_response = requests.get(
                            f'{MEALDB_BASE_URL}/lookup.php',
                            params={'i': meal_id}
                        )
                        
                        if detail_response.status_code == 200:
                            meal_details = detail_response.json().get('meals', [])[0]
                            
                            # Format ingredients list
                            ingredients_list = []
                            for i in range(1, 21):  # TheMealDB has up to 20 ingredients
                                ingredient = meal_details.get(f'strIngredient{i}')
                                measure = meal_details.get(f'strMeasure{i}')
                                if ingredient and ingredient.strip():
                                    ingredients_list.append({
                                        'original': f'{measure} {ingredient}'.strip()
                                    })
                            
                            recipe = {
                                'id': meal_details['idMeal'],
                                'title': meal_details['strMeal'],
                                'image': meal_details['strMealThumb'],
                                'instructions': meal_details['strInstructions'],
                                'extendedIngredients': ingredients_list,
                                'category': meal_details['strCategory'],
                                'area': meal_details['strArea']
                            }
                            
                            # Filter by dietary preferences if provided
                            if dietary_preferences:
                                category = meal_details['strCategory'].lower()
                                if any(pref.lower() in category for pref in dietary_preferences):
                                    recipes.append(recipe)
                            else:
                                recipes.append(recipe)
                else:
                    logger.debug(f"No meals found for ingredient {formatted_ingredient}")
        
        # If no recipes found through ingredients, try searching by name of first ingredient
        if not recipes and ingredients:
            logger.debug("No recipes found by ingredient filter, trying name search")
            search_response = requests.get(
                f'{MEALDB_BASE_URL}/search.php',
                params={'s': ingredients[0]}
            )
            
            if search_response.status_code == 200:
                search_meals = search_response.json().get('meals', [])
                if search_meals:
                    logger.debug(f"Found {len(search_meals)} meals by name search")
                    for meal in search_meals[:3]:
                        recipe = {
                            'id': meal['idMeal'],
                            'title': meal['strMeal'],
                            'image': meal['strMealThumb'],
                            'instructions': meal['strInstructions'],
                            'category': meal['strCategory'],
                            'area': meal['strArea'],
                            'extendedIngredients': []
                        }
                        
                        # Format ingredients list
                        for i in range(1, 21):
                            ingredient = meal.get(f'strIngredient{i}')
                            measure = meal.get(f'strMeasure{i}')
                            if ingredient and ingredient.strip():
                                recipe['extendedIngredients'].append({
                                    'original': f'{measure} {ingredient}'.strip()
                                })
                        
                        if dietary_preferences:
                            if any(pref.lower() in meal['strCategory'].lower() for pref in dietary_preferences):
                                recipes.append(recipe)
                        else:
                            recipes.append(recipe)
        
        # Remove duplicates based on recipe ID
        unique_recipes = {recipe['id']: recipe for recipe in recipes}
        result = list(unique_recipes.values())
        
        logger.debug(f"Returning {len(result)} recipes")
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Error occurred: {str(e)}", exc_info=True)
        return jsonify({'error': "An internal server error occurred. Please try again later."}), 500

if __name__ == '__main__':
    # Set debug=True for development only, for example, by checking an environment variable.
    app.run(debug=False)

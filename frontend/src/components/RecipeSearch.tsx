import { useState } from 'react'
import {
  Box,
  Button,
  Input,
  Stack,
  Text,
  Tag,
  TagLabel,
  CloseButton,
  Select,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Heading,
  List,
  ListItem,
  Spinner,
  useToast,
  HStack,
  Image,
  Badge
} from '@chakra-ui/react'
import axios from 'axios'

interface Recipe {
  id: string
  title: string
  image: string
  instructions: string
  category: string
  area: string
  extendedIngredients: Array<{
    original: string
  }>
}

const dietaryOptions = [
  'Beef',
  'Breakfast',
  'Chicken',
  'Dessert',
  'Goat',
  'Lamb',
  'Miscellaneous',
  'Pasta',
  'Pork',
  'Seafood',
  'Side',
  'Starter',
  'Vegan',
  'Vegetarian'
]

function RecipeSearch() {
  const [ingredients, setIngredients] = useState<string[]>([])
  const [currentIngredient, setCurrentIngredient] = useState('')
  const [preferences, setPreferences] = useState<string[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleAddIngredient = () => {
    const trimmedIngredient = currentIngredient.trim().toLowerCase()
    if (trimmedIngredient && !ingredients.includes(trimmedIngredient)) {
      // Remove any special characters and multiple spaces
      const cleanedIngredient = trimmedIngredient
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, ' ')
      setIngredients([...ingredients, cleanedIngredient])
      setCurrentIngredient('')
    }
  }

  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient))
  }

  const handlePreferenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (!preferences.includes(value)) {
      setPreferences([...preferences, value])
    }
  }

  const handleRemovePreference = (preference: string) => {
    setPreferences(preferences.filter(p => p !== preference))
  }

  const searchRecipes = async () => {
    if (ingredients.length === 0) {
      toast({
        title: 'No ingredients specified',
        description: 'Please add at least one ingredient to search for recipes.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('http://localhost:5000/api/recipes', {
        ingredients,
        preferences
      })
      setRecipes(response.data)
      
      if (response.data.length === 0) {
        toast({
          title: 'No recipes found',
          description: 'Try different ingredients or dietary preferences.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch recipes. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
    setLoading(false)
  }

  return (
    <Stack spacing={6}>
      <Box>
        <Text mb={2} fontSize="lg" fontWeight="bold">Add Ingredients</Text>
        <HStack>
          <Input
            value={currentIngredient}
            onChange={(e) => setCurrentIngredient(e.target.value)}
            placeholder="Enter an ingredient (e.g., chicken, tomato, rice)"
            onKeyPress={(e) => e.key === 'Enter' && handleAddIngredient()}
          />
          <Button onClick={handleAddIngredient}>Add</Button>
        </HStack>
        <Box mt={2}>
          <HStack flexWrap="wrap" gap={2}>
            {ingredients.map((ingredient) => (
              <Tag
                key={ingredient}
                size="md"
                borderRadius="full"
                variant="solid"
                colorScheme="green"
              >
                <TagLabel>{ingredient}</TagLabel>
                <CloseButton size="sm" onClick={() => handleRemoveIngredient(ingredient)} />
              </Tag>
            ))}
          </HStack>
        </Box>
      </Box>

      <Box>
        <Text mb={2} fontSize="lg" fontWeight="bold">Meal Type</Text>
        <HStack>
          <Select
            placeholder="Select meal type"
            onChange={handlePreferenceChange}
            value=""
          >
            {dietaryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </HStack>
        <Box mt={2}>
          <HStack flexWrap="wrap" gap={2}>
            {preferences.map((preference) => (
              <Tag
                key={preference}
                size="md"
                borderRadius="full"
                variant="solid"
                colorScheme="purple"
              >
                <TagLabel>{preference}</TagLabel>
                <CloseButton size="sm" onClick={() => handleRemovePreference(preference)} />
              </Tag>
            ))}
          </HStack>
        </Box>
      </Box>

      <Button
        colorScheme="blue"
        onClick={searchRecipes}
        isLoading={loading}
        loadingText="Searching..."
      >
        Search Recipes
      </Button>

      {loading ? (
        <Box textAlign="center">
          <Spinner size="xl" />
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {recipes.map((recipe) => (
            <Card key={recipe.id} overflow="hidden">
              <Image
                src={recipe.image}
                alt={recipe.title}
                objectFit="cover"
                height="200px"
              />
              <CardHeader>
                <Stack>
                  <Heading size="md">{recipe.title}</Heading>
                  <HStack>
                    <Badge colorScheme="green">{recipe.category}</Badge>
                    <Badge colorScheme="orange">{recipe.area}</Badge>
                  </HStack>
                </Stack>
              </CardHeader>
              <CardBody>
                <Stack spacing={4}>
                  <Box>
                    <Text fontWeight="bold" mb={2}>Ingredients:</Text>
                    <List spacing={2}>
                      {recipe.extendedIngredients.map((ingredient, index) => (
                        <ListItem key={index}>{ingredient.original}</ListItem>
                      ))}
                    </List>
                  </Box>
                  <Box>
                    <Text fontWeight="bold" mb={2}>Instructions:</Text>
                    <Text whiteSpace="pre-line">{recipe.instructions}</Text>
                  </Box>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  )
}

export default RecipeSearch 
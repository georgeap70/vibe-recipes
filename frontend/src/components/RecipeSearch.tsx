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
  HStack
} from '@chakra-ui/react'
import axios from 'axios'

interface Recipe {
  id: number
  title: string
  image: string
  instructions: string
  extendedIngredients: Array<{
    original: string
  }>
}

const dietaryOptions = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'ketogenic',
  'paleo',
  'low-carb'
]

function RecipeSearch() {
  const [ingredients, setIngredients] = useState<string[]>([])
  const [currentIngredient, setCurrentIngredient] = useState('')
  const [preferences, setPreferences] = useState<string[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const handleAddIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()])
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
            placeholder="Enter an ingredient"
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
        <Text mb={2} fontSize="lg" fontWeight="bold">Dietary Preferences</Text>
        <HStack>
          <Select
            placeholder="Select preference"
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
        disabled={loading}
        loadingText="Searching..."
      >
        Search Recipes
      </Button>

      {loading ? (
        <Box textAlign="center">
          <Spinner size="xl" />
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
          {recipes.map((recipe) => (
            <Card key={recipe.id}>
              <CardHeader>
                <Heading size="md">{recipe.title}</Heading>
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
                    <Text>{recipe.instructions}</Text>
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
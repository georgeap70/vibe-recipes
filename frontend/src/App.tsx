import { ChakraProvider, Container, Heading, VStack } from '@chakra-ui/react'
import RecipeSearch from './components/RecipeSearch'

function App() {
  return (
    <ChakraProvider>
      <Container maxW="container.xl" py={8}>
        <VStack spacing="8" align="stretch">
          <Heading as="h1" size="2xl" textAlign="center">
            Recipe Finder
          </Heading>
          <RecipeSearch />
        </VStack>
      </Container>
    </ChakraProvider>
  )
}

export default App

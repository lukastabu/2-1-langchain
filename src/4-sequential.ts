/**
 * Exercise 4: Sequential Chain (Example)
 * npm run exercise-4 {country}
 * i.e. npm run exercise-4 Italy
 * ---
 * In this example, we will show an example of a sequential chain.
 * Where the output of one step is used as the input for the next step.
 * Take note of the RunnableSequence class and how it is used to chain
 * the steps.
 */

import { ChatOpenAI } from '@langchain/openai';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
} from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { SystemMessage } from '@langchain/core/messages';

// Initialize the language model
const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: 'gpt-4o-mini',
});

// Chef "persona"
const chef = new SystemMessage(
  'You are a culinary expert who knows traditional dishes from around the world.'
);

// Location Chain
const locationPrompt = ChatPromptTemplate.fromMessages([
  chef,
  HumanMessagePromptTemplate.fromTemplate(
    'What is a classic dish from {location}? Please provide just the name of the dish.'
  ),
]);

const locationChain = locationPrompt.pipe(model);

// Recipe Chain
const recipePrompt = ChatPromptTemplate.fromMessages([
  chef,
  HumanMessagePromptTemplate.fromTemplate(
    'Please provide a short and simple recipe for how to make {meal} at home.'
  ),
]);

const recipeChain = recipePrompt.pipe(model);

// Create a sequential chain
const overallChain = RunnableSequence.from([
  {
    meal: locationChain.pipe((output) => output.content),
  },
  recipeChain,
]);

// Function to run the chain
async function getDishAndRecipe(location: string) {
  const result = await overallChain.invoke({
    location,
  });

  return result.content;
}

// Example usage using command line input
const country = process.argv[2];

if (!country) {
  console.error('Please provide a country name as an argument');
  process.exit(1);
}

console.log(`Cooking up a recipe from ${country}...`);

const review = await getDishAndRecipe(country);
console.log(review);

/**
 * Exercise 3: Chains (Example)
 * npm run exercise-3
 * ---
 * This example asks you for a name and location and summarizes that information.
 * We can combine multiple messages into a few chains that will be used to collect user information.
 * Take note of the shared system prompt called `dataCollector` and how we accumulate
 * user information passing it from one chain to another.
 */

import { ChatOpenAI } from '@langchain/openai';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
} from '@langchain/core/prompts';
import * as readline from 'node:readline';
import { SystemMessage } from '@langchain/core/messages';

// Initialize the language model
const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: 'gpt-4o-mini',
});

// A shared data collector template
const dataCollector = new SystemMessage(
  'You are a friendly assistant helping to collect user information. Your responses should be warm and engaging.'
);

const namePrompt = ChatPromptTemplate.fromMessages([
  dataCollector,
  HumanMessagePromptTemplate.fromTemplate(
    'Please greet the user and ask for their name.'
  ),
]);

const locationPrompt = ChatPromptTemplate.fromMessages([
  dataCollector,
  HumanMessagePromptTemplate.fromTemplate(`
    The user's name is {name}.
    Please ask them about their location in a friendly way.
  `),
]);

const summaryPrompt = ChatPromptTemplate.fromMessages([
  dataCollector,
  HumanMessagePromptTemplate.fromTemplate(`
    Please create a friendly summary for this user:
    Name: {name}
    Location: {location}
  `),
]);

// Create chains
const nameChain = namePrompt.pipe(model);
const locationChain = locationPrompt.pipe(model);
const summaryChain = summaryPrompt.pipe(model);

// Function to run the information collection process
async function collectUserInformation() {
  // Step 1: Name Collection
  const nameResponse = await nameChain.invoke({});
  console.log(nameResponse.content);
  const name = await getUserInput('Your Name: ');

  // Step 2: Location Collection
  const locationResponse = await locationChain.invoke({ name });
  console.log(locationResponse.content);
  const location = await getUserInput('Your Location: ');

  // Step 3: Summary
  const summaryResponse = await summaryChain.invoke({ name, location });

  return {
    name,
    location,
    summary: summaryResponse.content,
  };
}

// Helper function to get user input
async function getUserInput(prompt: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Run the information collection
const userInformation = await collectUserInformation();
console.log('\nCollected User Information:');
console.log(userInformation);

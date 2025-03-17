/**
 * Exercise 1: Forming Messages with LangChain
 * npm run exercise-1
 * ---
 * @docs: https://www.npmjs.com/package/@langchain/openai
 * As a warm-up exercise, we will form a very simple conversation with LangChain.
 * */

import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

const model = new ChatOpenAI({
  model: 'gpt-4o-mini',
  apiKey: process.env.OPENAI_API_KEY!,
});

// Up until this point, we were forming and sending JSON to OpenAI API.
// With LangChain, we can use the messag classes instead.
const response = await model.invoke([
  'You are a nice AI bot that helps a user figure out what to eat in one short sentence',
  'I like tomatoes, what should I eat?',

  // TODO: 1. Rewrite the messages above into the
  //  { type: 'system' | 'user', content: string } format.
  // TypeScript will help you with the types.
  // ---
  // TODO: 2. We can also use the message classes from the core package. Use SystemMessage and
  // HumanMessage classes to form the messages instead of plain objects.
  // ---
  // TODO: 3. Add a new pair of messages to the conversation. You can import the AIMessage class
  // from the core package. The conversation could be extended with messages like these:
  // AI: "How about a fresh caprese salad?"
  // Human: "A good idea. Can you give me a recipe?"
]);

console.log(response.content);

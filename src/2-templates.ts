/**
 * Exercise 2: Prompt Templates (Example)
 * npm run exercise-2
 * ---
 * An example of how to use prompt templates and pipes with LangChain.
 */

import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

const model = new ChatOpenAI({
  model: 'gpt-4o-mini',
  apiKey: process.env.OPENAI_API_KEY!,
});

// A prompt template, which allows separating the prompt from user input.
const prompt = ChatPromptTemplate.fromTemplate('Tell me a joke about {topic}');

// We can also use `pipe()`, as if we were using a stream:
// 1. Form a prompt -> 2. Send it to the model -> 3. Parse the output
const chain = prompt.pipe(model).pipe(new StringOutputParser());

// TODO: This is actually type-safe at the editor level - try changing the key
// "topic" to something else.
// Your code editor should highlight that this key is not allowed. The same goes
// for removing it.
const response = await chain.invoke({ topic: 'bears' });

console.log('response', response);

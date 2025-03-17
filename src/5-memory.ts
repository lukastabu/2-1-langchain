/**
 * Exercise 5: Memory (Example)
 * npm run exercise-5
 * ---
 * In this example, we show how you could preserve the conversation history
 * in memory and use it to generate more contextually relevant responses.
 */

import { ChatOpenAI } from '@langchain/openai';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatMessageHistory } from 'langchain/memory';
import { HumanMessage } from '@langchain/core/messages';

// Initialize the language model
const model = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  openAIApiKey: process.env.OPENAI_API_KEY!,
});

// Create a conversation memory buffer
const memory = new ChatMessageHistory();

// Create a chat prompt using the conversation history
const template = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(`
The following is a friendly conversation between a human and an AI. The AI is talkative and provides lots of specific details based on the existing chat history. If the AI does not know the answer to a question, it truthfully says it does not know.

## Chat history:
{history}`),
  HumanMessagePromptTemplate.fromTemplate('{input}'),
]);

// For the runnable sequence, we need to provide template and model in the array.
// Since we are also using variables, we need to add an object specifying how it
// should get values {input} and {history}.
const chain = RunnableSequence.from([
  {
    input: (userInput: string) => userInput,
    history: async () => {
      const messages = await memory.getMessages();

      return messages
        .map((message) => {
          const role = message instanceof HumanMessage ? 'User' : 'AI';
          return `${role}: ${message.content}`;
        })
        .join('\n');
    },
  },
  template,
  model,
]);

// Function to demonstrate memory usage
async function runMemoryDemo() {
  console.log('Conversational Memory Demonstration:');

  // Simulate a conversation with multiple turns
  const userMessages = [
    "My name is Alice and I'm from New York.",
    'What do you know about me?',
    'Tell me about my city.',
    "Can you remind me what we've discussed?",
  ];

  // Run through conversation turns
  for (const userMessage of userMessages) {
    console.log('User:', userMessage);

    // Get response from the assistant
    const assistantMessage = await chain.invoke(userMessage);
    console.log('Assistant:', assistantMessage.content);

    // Store the interaction in memory
    await memory.addUserMessage(userMessage);
    await memory.addAIMessage(assistantMessage.content as string);
  }

  // Display current conversation history
  const memoryVariables = await memory.getMessages();
  console.log('\nCurrent Conversation History:');
  console.log(memoryVariables);
}

// Run the demonstration
await runMemoryDemo();

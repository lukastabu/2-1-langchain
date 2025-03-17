/**
 * Exercise 6: Summary Memory (Example)
 * npm run exercise-6
 * ---
 * In this example, we show how you could preserve the conversation history
 * in memory and use it to generate more contextually relevant responses.
 * Run the exercise file and observe the difference in the final conversation history
 * that is preserved. How it differs from the ChatMessageHistory in the previous example?
 * Also, note the slight differences in the implementation - how messages are stored and
 * retrieved from memory.
 */

import { ChatOpenAI } from '@langchain/openai';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ConversationSummaryMemory } from 'langchain/memory';

// Initialize the language model
const model = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  openAIApiKey: process.env.OPENAI_API_KEY!,
});

// Create a conversation memory, which will self-summarize itself after
// every turn (user and AI message). It will summarize the messages using
// a provide language model.
// This, of course, increases the token usage, especially for short conversations.
// However, if you need to maintain a summary of a longer conversation, this could
// be a useful feature.
const memory = new ConversationSummaryMemory({
  llm: model,
});

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
      // default name of memory variable is 'history'
      const { history } = await memory.loadMemoryVariables({});

      return history;
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
    await memory.saveContext(
      {
        input: userMessage,
      },
      {
        output: assistantMessage,
      }
    );
  }

  // Display current conversation history
  const memoryVariables = await memory.loadMemoryVariables({});
  console.log('-'.repeat(40));
  console.log('\nCurrent Conversation History:');
  console.log(memoryVariables.history);
}

// Run the demonstration
await runMemoryDemo();

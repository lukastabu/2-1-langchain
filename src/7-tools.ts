/**
 * Exercise 7: Tool use (Optional, advanced example)
 * npm run exercise-7
 * ---
 * In this example, we combine multiple ideas:
 * - we define a tool for mathematical calculations using the mathjs package
 * - we validate the input schema for the tool using the zod package
 * - we create an agent that can call the tool for specific tasks
 */

import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { evaluate } from 'mathjs';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createToolCallingAgent } from 'langchain/agents';
import { AgentExecutor } from 'langchain/agents';

// Define the calculator tool with safe math evaluation
const calculatorTool = tool(
  async ({ expression }: { expression: string }) => {
    try {
      const result = evaluate(expression);
      return result.toString();
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : 'Invalid expression'}`;
    }
  },
  {
    name: 'Calculator',
    description:
      'Performs mathematical calculations. Input: mathjs-compatible mathematical expression as string.',
    schema: z.object({
      expression: z.string().describe('Mathematical expression to evaluate'),
    }),
  }
);

// Initialize the chat model
const llm = new ChatOpenAI({
  model: 'gpt-4o-mini',
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Configure the agent system
const prompt = ChatPromptTemplate.fromMessages([
  // using the array syntax this time
  [
    'system',
    'You are a math expert assistant. Use tools for all calculations.',
  ],
  ['human', '{input}'],
  ['placeholder', '{agent_scratchpad}'],
]);

// Create agent components
const tools = [calculatorTool];
const agent = createToolCallingAgent({ llm, tools, prompt });
const agentExecutor = new AgentExecutor({ agent, tools });

// Enhanced evaluation function with logging
async function evaluateExpressions() {
  const testCases = [
    '2 + 2',
    'sqrt(16) * 3',
    'sin(pi/2) ^ 2',
    'log(e, 10)',
    '(15 * 3) + (27 / 3)',
  ];

  console.log('=== Direct Tool Evaluation ===');
  for (const expr of testCases) {
    try {
      const result = await calculatorTool.invoke({ expression: expr });
      console.log(`🧪 ${expr.padEnd(20)} => ${result}`);
    } catch (error) {
      console.log(`❌ ${expr.padEnd(20)} => ${error}`);
    }
  }

  console.log('\n=== Agent-based Evaluation ===');
  const queries = [
    "What's the area of a circle with radius 5?",
    'Calculate 2^8 plus the square root of 81',
    'What is 45% of 890 plus 10 factorial?',
    'If I have 3^4 apples and eat 15, how many remain?',
  ];

  for (const query of queries) {
    const response = await agentExecutor.invoke({ input: query });
    console.log(`❓ ${query}`);
    console.log(`📝 ${response.output}\n`);
  }
}

// Execute the evaluation
await evaluateExpressions();

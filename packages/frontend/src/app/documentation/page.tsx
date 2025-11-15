import type { Metadata } from 'next';
import { DocumentationSidebar, CodeBlock } from '../../components/documentation';

export const metadata: Metadata = {
  title: 'Documentation - AgentKit API Reference | Agentage',
  description:
    'Complete API documentation for AgentKit - Learn how to build AI agents with our comprehensive guide.',
};

export default function DocumentationPage() {
  const navigationItems = [
    { id: 'installation', label: 'Installation', href: '#installation' },
    { id: 'core-functions', label: 'Core Functions', href: '#core-functions' },
    { id: 'agent-function', label: 'agent()', href: '#agent-function' },
    { id: 'tool-function', label: 'tool()', href: '#tool-function' },
    { id: 'agent-interface', label: 'Agent Interface', href: '#agent-interface' },
    { id: 'types', label: 'Types & Interfaces', href: '#types' },
    { id: 'errors', label: 'Error Classes', href: '#errors' },
    { id: 'examples', label: 'Examples', href: '#examples' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content wrapper */}
      <main className="flex-1">
        {/* Documentation Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-12">
              {/* Sidebar Navigation */}
              <DocumentationSidebar items={navigationItems} />

              {/* Main Documentation Content */}
              <div className="lg:col-span-3">
                {/* Hero Section */}
                <div className="mb-12">
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    API Reference
                  </h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Complete API documentation for AgentKit. Learn how to create AI agents, define
                    tools, and build powerful applications.
                  </p>
                </div>

                {/* Installation */}
                <section id="installation" className="mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Installation</h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 mb-4">
                      Install the AgentKit SDK via npm to get started building AI agents:
                    </p>
                    <CodeBlock code="npm install @agentage/sdk" language="bash" />
                  </div>
                </section>

                {/* Core Functions */}
                <section id="core-functions" className="mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Core Functions</h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 mb-4">
                      AgentKit provides two primary functions for building AI agents:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2">
                      <li>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">agent()</code> -
                        Creates an AI agent that can process messages and execute tools
                      </li>
                      <li>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">tool()</code> -
                        Creates a tool with type-safe input validation
                      </li>
                    </ul>
                  </div>
                </section>

                {/* agent() Function */}
                <section id="agent-function" className="mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    <code className="bg-blue-50 px-3 py-1 rounded">agent()</code>
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 mb-4">
                      Creates an AI agent that can process messages and execute tools.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Signature</h3>
                    <CodeBlock
                      code={`function agent(name: string): Agent
function agent(config: AgentConfig): Agent`}
                      className="mb-6"
                    />

                    <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Parameters</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                      <p className="font-semibold text-gray-900 mb-2">Pattern 1: Builder</p>
                      <ul className="list-disc pl-6 text-gray-600">
                        <li>
                          <code className="bg-white px-2 py-1 rounded text-sm">name</code> (string)
                          - Name identifier for the agent
                        </li>
                      </ul>
                      <p className="font-semibold text-gray-900 mt-4 mb-2">
                        Pattern 2: Config Object
                      </p>
                      <ul className="list-disc pl-6 text-gray-600">
                        <li>
                          <code className="bg-white px-2 py-1 rounded text-sm">config</code>{' '}
                          (AgentConfig) - Complete agent configuration object
                        </li>
                      </ul>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Examples</h3>
                    <p className="font-semibold text-gray-700 mb-2">Builder Pattern:</p>
                    <CodeBlock
                      code={`import { agent } from '@agentage/sdk';

const assistant = agent('my-assistant')
  .model('gpt-4')
  .instructions('You are helpful');

const response = await assistant.send('Hello');
console.log(response.content);`}
                      className="mb-6"
                    />

                    <p className="font-semibold text-gray-700 mb-2">Config Object Pattern:</p>
                    <CodeBlock
                      code={`const assistant = agent({
  name: 'my-assistant',
  model: 'gpt-4',
  instructions: 'You are helpful'
});

await assistant.send('Hello');`}
                      className="mb-6"
                    />
                  </div>
                </section>

                {/* tool() Function */}
                <section id="tool-function" className="mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    <code className="bg-blue-50 px-3 py-1 rounded">tool()</code>
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 mb-4">
                      Creates a tool that agents can execute with type-safe input validation.
                    </p>

                    <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Signature</h3>
                    <CodeBlock
                      code={`function tool<TSchema, TResult>(
  config: CreateToolConfig<TSchema>,
  execute: ToolExecuteFunction<TSchema, TResult>
): Tool<InferSchemaType<TSchema>, TResult>`}
                      className="mb-6"
                    />

                    <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Parameters</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                      <ul className="list-disc pl-6 text-gray-600 space-y-2">
                        <li>
                          <code className="bg-white px-2 py-1 rounded text-sm">config</code>{' '}
                          (CreateToolConfig) - Tool configuration
                          <ul className="list-circle pl-6 mt-1">
                            <li>
                              <code className="bg-white px-2 py-1 rounded text-sm">name</code> -
                              Unique tool identifier
                            </li>
                            <li>
                              <code className="bg-white px-2 py-1 rounded text-sm">
                                description
                              </code>{' '}
                              - What the tool does
                            </li>
                            <li>
                              <code className="bg-white px-2 py-1 rounded text-sm">
                                inputSchema
                              </code>{' '}
                              - Zod schema for validation
                            </li>
                            <li>
                              <code className="bg-white px-2 py-1 rounded text-sm">title</code>{' '}
                              (optional) - Display name
                            </li>
                          </ul>
                        </li>
                        <li>
                          <code className="bg-white px-2 py-1 rounded text-sm">execute</code>{' '}
                          (ToolExecuteFunction) - Async function that executes the tool
                        </li>
                      </ul>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Example</h3>
                    <CodeBlock
                      code={`import { tool } from '@agentage/sdk';
import { z } from 'zod';

const calculator = tool(
  {
    name: 'calculator',
    description: 'Performs basic math operations',
    inputSchema: z.object({
      operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
      a: z.number(),
      b: z.number(),
    }),
  },
  async (params) => {
    const { operation, a, b } = params;
    switch (operation) {
      case 'add': return a + b;
      case 'subtract': return a - b;
      case 'multiply': return a * b;
      case 'divide': return a / b;
    }
  }
);`}
                      className="mb-6"
                    />
                  </div>
                </section>

                {/* Agent Interface */}
                <section id="agent-interface" className="mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Agent Interface</h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-600 mb-4">
                      The Agent interface provides methods for configuring and using agents.
                    </p>

                    <CodeBlock
                      code={`interface Agent {
  model(modelName: string, config?: ModelConfig): Agent;
  instructions(text: string): Agent;
  tools(toolList: Tool[]): Agent;
  config(configEntries: ConfigEntry[]): Agent;
  send(message: string): Promise<AgentResponse>;
  stream(message: string): AsyncIterableIterator<AgentResponse>;
}`}
                      className="mb-6"
                    />

                    <h3 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Methods</h3>
                    <div className="space-y-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            .model(modelName, config?)
                          </code>
                        </h4>
                        <p className="text-gray-600 mb-2">Set the AI model to use.</p>
                        <p className="text-sm text-gray-500">
                          Returns: <code>Agent</code> (for chaining)
                        </p>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            .instructions(text)
                          </code>
                        </h4>
                        <p className="text-gray-600 mb-2">
                          Set the system instructions for the agent.
                        </p>
                        <p className="text-sm text-gray-500">
                          Returns: <code>Agent</code> (for chaining)
                        </p>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            .tools(toolList)
                          </code>
                        </h4>
                        <p className="text-gray-600 mb-2">Provide tools the agent can execute.</p>
                        <p className="text-sm text-gray-500">
                          Returns: <code>Agent</code> (for chaining)
                        </p>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            .send(message)
                          </code>
                        </h4>
                        <p className="text-gray-600 mb-2">
                          Send a message to the agent and get a response.
                        </p>
                        <p className="text-sm text-gray-500">
                          Returns: <code>Promise&lt;AgentResponse&gt;</code>
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Types & Interfaces */}
                <section id="types" className="mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Types & Interfaces</h2>
                  <div className="prose prose-lg max-w-none">
                    <div className="space-y-8">
                      {/* AgentConfig */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">AgentConfig</h3>
                        <p className="text-gray-600 mb-4">
                          Configuration object for creating agents.
                        </p>
                        <CodeBlock
                          code={`interface AgentConfig {
  name: string;
  model: string | ModelDefinition;
  instructions?: string;
  tools?: Tool[];
}`}
                          className="mb-4"
                        />
                      </div>

                      {/* AgentResponse */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">AgentResponse</h3>
                        <p className="text-gray-600 mb-4">Response from agent execution.</p>
                        <CodeBlock
                          code={`interface AgentResponse<T = unknown> {
  content: string;
  metadata?: Record<string, unknown>;
  data?: T;
  toolCalls?: ToolCall[];
}`}
                          className="mb-4"
                        />
                      </div>

                      {/* ModelConfig */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">ModelConfig</h3>
                        <p className="text-gray-600 mb-4">Configuration options for AI models.</p>
                        <CodeBlock
                          code={`interface ModelConfig {
  temperature?: number;      // 0.0-1.0
  maxTokens?: number;
  topP?: number;            // 0.0-1.0
  frequencyPenalty?: number; // -2.0-2.0
  presencePenalty?: number;  // -2.0-2.0
}`}
                          className="mb-4"
                        />
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-sm text-gray-600">
                            <strong>Note:</strong> Temperature controls randomness:{' '}
                            <code className="bg-white px-1 rounded">0.0</code> = deterministic,{' '}
                            <code className="bg-white px-1 rounded">1.0</code> = creative
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Error Classes */}
                <section id="errors" className="mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Error Classes</h2>
                  <div className="prose prose-lg max-w-none">
                    <div className="space-y-6">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-2">MissingApiKeyError</h4>
                        <p className="text-gray-600 mb-2">
                          Thrown when OpenAI API key is not configured.
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Solution:</strong> Set{' '}
                          <code className="bg-white px-2 py-1 rounded">OPENAI_API_KEY</code>{' '}
                          environment variable or use <code>.config()</code>
                        </p>
                      </div>

                      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          UnsupportedModelError
                        </h4>
                        <p className="text-gray-600 mb-2">
                          Thrown when using an unsupported model.
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Solution:</strong> Use supported models (gpt-4, gpt-3.5-turbo)
                        </p>
                      </div>

                      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-2">ToolNotFoundError</h4>
                        <p className="text-gray-600 mb-2">
                          Thrown when agent tries to execute a tool that doesn&apos;t exist.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Examples */}
                <section id="examples" className="mb-16">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Complete Examples</h2>
                  <div className="prose prose-lg max-w-none">
                    <div className="space-y-8">
                      {/* Basic Agent */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Agent</h3>
                        <CodeBlock
                          code={`import { agent } from '@agentage/sdk';

const assistant = agent('assistant')
  .model('gpt-4')
  .instructions('Be helpful and concise');

const response = await assistant.send('What is Node.js?');
console.log(response.content);`}
                        />
                      </div>

                      {/* Agent with Tools */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                          Agent with Tools
                        </h3>
                        <CodeBlock
                          code={`import { agent, tool } from '@agentage/sdk';
import { z } from 'zod';

const weatherTool = tool(
  {
    name: 'get_weather',
    description: 'Get current weather for a city',
    inputSchema: z.object({
      city: z.string(),
    }),
  },
  async ({ city }) => {
    return \`Weather in \${city}: Sunny, 72°F\`;
  }
);

const assistant = agent('weather-bot')
  .model('gpt-4')
  .instructions('Help users with weather information')
  .tools([weatherTool]);

const response = await assistant.send('What is the weather in London?');
console.log(response.content);`}
                        />
                      </div>

                      {/* Error Handling */}
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                          Error Handling
                        </h3>
                        <CodeBlock
                          code={`import { MissingApiKeyError } from '@agentage/sdk';

try {
  const response = await agent('test')
    .model('gpt-4')
    .send('Hello');
  console.log(response.content);
} catch (error) {
  if (error instanceof MissingApiKeyError) {
    console.error('Please set OPENAI_API_KEY');
  }
}`}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Next Steps */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 mt-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Next Steps</h3>
                  <p className="text-gray-600 mb-6">
                    Now that you understand the API, explore these resources:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <a
                      href="https://github.com/agentage/agentkit"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
                    >
                      <svg
                        className="w-8 h-8 text-blue-600 mr-3"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      <div>
                        <div className="font-semibold text-gray-900">View on GitHub</div>
                        <div className="text-sm text-gray-600">See the source code</div>
                      </div>
                    </a>
                    <a
                      href="https://github.com/agentage/agentkit/tree/main/examples"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
                    >
                      <svg
                        className="w-8 h-8 text-blue-600 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                        />
                      </svg>
                      <div>
                        <div className="font-semibold text-gray-900">Browse Examples</div>
                        <div className="text-sm text-gray-600">Learn from code samples</div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Example: Adding Tools/Function Calling to OpenAI Agent
 * 
 * This file shows how to extend the OpenAI agent with custom tools
 * that can create tickets, check account status, etc.
 */

import OpenAI from 'openai';
import type { ChatCompletionTool } from 'openai/resources/chat/completions';

/**
 * Define available tools for the AI agent
 */
export const agentTools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'create_ticket',
      description: 'Create a support ticket for the customer when they report an issue or need assistance',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Brief title of the issue',
          },
          description: {
            type: 'string',
            description: 'Detailed description of the customer issue',
          },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'urgent'],
            description: 'Priority level of the ticket',
          },
          category: {
            type: 'string',
            enum: ['billing', 'technical', 'service_request', 'complaint'],
            description: 'Category of the ticket',
          },
        },
        required: ['title', 'description', 'priority', 'category'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_account_balance',
      description: 'Check the current balance and payment status for a customer account',
      parameters: {
        type: 'object',
        properties: {
          account_number: {
            type: 'string',
            description: 'Customer account number',
          },
        },
        required: ['account_number'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'schedule_appointment',
      description: 'Schedule a service appointment for the customer',
      parameters: {
        type: 'object',
        properties: {
          service_type: {
            type: 'string',
            enum: ['installation', 'repair', 'inspection', 'meter_reading'],
            description: 'Type of service needed',
          },
          preferred_date: {
            type: 'string',
            description: 'Preferred date in YYYY-MM-DD format',
          },
          preferred_time: {
            type: 'string',
            enum: ['morning', 'afternoon', 'evening'],
            description: 'Preferred time of day',
          },
          notes: {
            type: 'string',
            description: 'Additional notes or special requirements',
          },
        },
        required: ['service_type', 'preferred_date', 'preferred_time'],
      },
    },
  },
];

/**
 * Execute tool functions
 */
export async function executeToolCall(toolName: string, args: any): Promise<any> {
  console.log(`🔧 Executing tool: ${toolName}`);
  console.log(`   Arguments:`, args);

  switch (toolName) {
    case 'create_ticket':
      return await createTicket(args);

    case 'check_account_balance':
      return await checkAccountBalance(args);

    case 'schedule_appointment':
      return await scheduleAppointment(args);

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

/**
 * Create a support ticket
 */
async function createTicket(args: {
  title: string;
  description: string;
  priority: string;
  category: string;
}): Promise<any> {
  // TODO: Integrate with your ticket creation system
  // Example: Call Prisma to create ticket in database
  
  console.log('📋 Creating ticket:', args);
  
  // Mock response for now
  const ticketId = Math.floor(Math.random() * 10000);
  
  return {
    success: true,
    ticketId: ticketId,
    message: `Ticket #${ticketId} created successfully`,
    data: {
      id: ticketId,
      ...args,
      status: 'open',
      createdAt: new Date().toISOString(),
    },
  };
}

/**
 * Check account balance
 */
async function checkAccountBalance(args: { account_number: string }): Promise<any> {
  // TODO: Integrate with CEA API or database
  
  console.log('💰 Checking balance for account:', args.account_number);
  
  // Mock response
  return {
    success: true,
    accountNumber: args.account_number,
    balance: 1250.50,
    currency: 'MXN',
    lastPayment: {
      amount: 500.00,
      date: '2025-12-15',
    },
    nextDueDate: '2026-01-15',
    status: 'active',
  };
}

/**
 * Schedule an appointment
 */
async function scheduleAppointment(args: {
  service_type: string;
  preferred_date: string;
  preferred_time: string;
  notes?: string;
}): Promise<any> {
  // TODO: Integrate with scheduling system
  
  console.log('📅 Scheduling appointment:', args);
  
  // Mock response
  const appointmentId = Math.floor(Math.random() * 10000);
  
  return {
    success: true,
    appointmentId: appointmentId,
    message: `Appointment #${appointmentId} scheduled successfully`,
    data: {
      id: appointmentId,
      ...args,
      status: 'scheduled',
      confirmationCode: `APPT-${appointmentId}`,
      createdAt: new Date().toISOString(),
    },
  };
}

/**
 * Example: How to use tools in the OpenAI service
 * 
 * Add this to openai-agent.service.ts in the sendMessage method:
 */
export async function sendMessageWithTools(
  client: OpenAI,
  messages: any[],
  config: any
): Promise<any> {
  // Initial API call with tools
  let completion = await client.chat.completions.create({
    model: config.model,
    messages: messages,
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    tools: agentTools, // Add tools here
  });

  let response = completion.choices[0];

  // Handle tool calls
  while (response.finish_reason === 'tool_calls' && response.message.tool_calls) {
    // Add assistant's message with tool calls to history
    messages.push(response.message);

    // Execute each tool call
    for (const toolCall of response.message.tool_calls) {
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      // Execute the tool
      const toolResult = await executeToolCall(functionName, functionArgs);

      // Add tool result to messages
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult),
      });
    }

    // Call API again with tool results
    completion = await client.chat.completions.create({
      model: config.model,
      messages: messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      tools: agentTools,
    });

    response = completion.choices[0];
  }

  return {
    content: response.message.content || 'No response',
    toolCalls: response.message.tool_calls,
    metadata: {
      model: completion.model,
      usage: completion.usage,
      finishReason: response.finish_reason,
    },
  };
}

/**
 * To enable tools in your service:
 * 
 * 1. Import this file in openai-agent.service.ts
 * 2. Replace the sendMessage implementation with sendMessageWithTools
 * 3. Implement the actual tool functions (create_ticket, etc.)
 * 4. Update the system prompt to mention available tools
 * 
 * Example system prompt:
 * "You are a customer service AI with access to the following tools:
 * - create_ticket: Create support tickets
 * - check_account_balance: Check customer balances
 * - schedule_appointment: Schedule service appointments
 * 
 * Use these tools when appropriate to help customers."
 */


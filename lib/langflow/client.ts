// @ts-nocheck
const LANGFLOW_BASE_URL = process.env.LANGFLOW_URL || 'http://localhost:7860';
const LANGFLOW_FLOW_ID = process.env.LANGFLOW_FLOW_ID || '463a5ed5-cb21-4a35-a9fe-5c266085a252';
const LANGFLOW_API_KEY = process.env.LANGFLOW_API_KEY;

export interface LangflowChatInput {
  task_id: string;
  task_title: string;
  task_description: string;
  priority: string;
  chat_input: string;
  chat_history?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  uploaded_documents?: string[];
}

export interface LangflowChatResponse {
  response?: string;
  task_understanding?: string;
  research_output?: string;
  execution_steps?: string[];
  email_draft?: {
    subject: string;
    body: string;
    recipient: string;
  };
  should_send_email?: boolean;
  [key: string]: any;
}

export async function executeLangflowChat(input: LangflowChatInput): Promise<LangflowChatResponse> {
  if (!LANGFLOW_API_KEY) {
    return generateMockChatResponse(input);
  }

  try {
    const url = `${LANGFLOW_BASE_URL}/api/v1/run/${LANGFLOW_FLOW_ID}`;
    
    // STRICT SYSTEM MESSAGE ENFORCEMENT
    // Ensure the system message from history (if present) is prioritized.
    // If Langflow graph supports tweaks for system message, we could add it here.
    // For now, we rely on chat_history being passed correctly.
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LANGFLOW_API_KEY}`,
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        inputs: {
          task_id: input.task_id,
          task_title: input.task_title,
          task_description: input.task_description,
          priority: input.priority,
          chat_input: input.chat_input,
          chat_history: input.chat_history || [],
          uploaded_documents: input.uploaded_documents || [],
        },
        tweaks: {},
      }),
    });

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Unable to read error response';
      }
      
      if (response.status === 401 || response.status === 403) {
        console.warn('Langflow authentication failed. Using mock response.');
        return generateMockChatResponse(input);
      } else if (response.status === 404) {
        throw new Error(`Langflow flow not found at ${LANGFLOW_BASE_URL}`);
      } else {
        throw new Error(`Langflow API error (${response.status}): ${errorText.substring(0, 200)}`);
      }
    }

    const data = await response.json();
    return parseLangflowChatResponse(data);
  } catch (error: any) {
    if (error.message?.includes('fetch failed') || error.message?.includes('ECONNREFUSED') || error.code === 'ECONNREFUSED') {
      console.warn('Cannot connect to Langflow. Using mock response.');
      return generateMockChatResponse(input);
    }
    
    if (error.message?.includes('authentication') || error.message?.includes('API key')) {
      console.warn('Langflow authentication issue. Using mock response.');
      return generateMockChatResponse(input);
    }
    
    console.error('Langflow execution error:', error);
    throw error;
  }
}

function parseLangflowChatResponse(response: any): LangflowChatResponse {
  try {
    const validTexts: string[] = [];
    let emailDraft: { subject: string; body: string; recipient: string } | undefined;
    let should_send_email = false;

    if (response.outputs) {
      const outputKeys = Object.keys(response.outputs);
      
      for (const key of outputKeys) {
        const output = response.outputs[key];
        if (output?.outputs && Array.isArray(output.outputs)) {
          for (const item of output.outputs) {
            if (item?.results?.message?.text) {
              const text = item.results.message.text;
              
              // Filter out internal/analytical outputs
              if (
                text.includes('Task Understanding:') ||
                text.includes('Execution Plan:') ||
                text.includes('is a valid query') ||
                text.includes('requires research') ||
                text.length < 5
              ) {
                continue;
              }

              validTexts.push(text);
              
              // Check for email intent
              if (text.toLowerCase().includes('email') || text.toLowerCase().includes('send to')) {
                const emailMatch = text.match(/(?:to|send to|email to)\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
                if (emailMatch) {
                  emailDraft = {
                    subject: extractEmailSubject(text),
                    body: extractEmailBody(text),
                    recipient: emailMatch[1],
                  };
                  should_send_email = true;
                }
              }
            }
          }
        }
      }
    }
    
    // Return the final valid text response
    if (validTexts.length > 0) {
      return {
        response: validTexts[validTexts.length - 1],
        email_draft: emailDraft,
        should_send_email: should_send_email,
      };
    }

    return {
      response: JSON.stringify(response, null, 2),
    };
  } catch (error) {
    console.error('Error parsing Langflow response:', error);
    return {
      response: 'I encountered an error processing your request. Please try again.',
    };
  }
}

function extractEmailSubject(text: string): string {
  const subjectMatch = text.match(/subject[:\s]+(.+?)(?:\n|$)/i);
  if (subjectMatch) return subjectMatch[1].trim();
  
  const lines = text.split('\n');
  if (lines.length > 0 && lines[0].length < 100) return lines[0];
  
  return 'Message';
}

function extractEmailBody(text: string): string {
  const bodyMatch = text.match(/body[:\s]+(.+)/is);
  if (bodyMatch) return bodyMatch[1].trim();
  
  return text;
}

function generateMockChatResponse(input: LangflowChatInput): LangflowChatResponse {
  const message = input.chat_input.toLowerCase();
  // We do NOT concatenate title/description into a 'fullContext' for the main routing logic
  // to prevent the task title from constantly triggering the "Task Definition" response.
  // We only use title/description if the user's input is vague or explicitly asks about the task.
  
  const taskContext = `${input.task_title} ${input.task_description}`.toLowerCase();

  // Email intent detection - Check MESSAGE first
  const emailKeywords = ['email', 'send', 'mail', 'reach out', 'contact', 'message'];
  const isEmailIntent = emailKeywords.some(keyword => message.includes(keyword));
  
  if (isEmailIntent) {
     const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
     const emailMatch = message.match(emailRegex) || taskContext.match(emailRegex);
     
     if (emailMatch) {
        const recipient = emailMatch[0];
        const subject = input.task_title.length > 50 ? input.task_title.substring(0, 50) : input.task_title;
        // Use chat input as body if it's a drafting request, otherwise fall back to desc
        const body = input.chat_input.replace(emailRegex, '').replace(/draft|email|send|to/gi, '').trim() || input.task_description;
        
        return {
          response: `I have drafted an email to ${recipient} regarding "${subject}". You can review and send it from the dashboard.`,
          email_draft: {
            subject,
            body: `Hello,\n\n${body}\n\nBest regards`,
            recipient,
          },
          should_send_email: false,
        };
     }
  }
  
  // Specific User Questions (High Priority)
  if (message.includes('portfolio')) {
      return {
          response: "For a frontend role, your portfolio should demonstrate practical React experience. Include 3-5 distinct projects: 1. A complex app consuming an API (e.g., dashboard, e-commerce). 2. A static site generator or blog. 3. A collaborative project if possible. Highlight clean code, component modularity, and proper state management."
      };
  }

  if (message.includes('salary') || message.includes('pay') || message.includes('compensation')) {
      return {
          response: "Internship compensation varies by company and location. Major tech companies typically offer $30-$60/hour plus housing stipends. Startups may offer $20-$40/hour. Check specific job listings for accurate figures."
      };
  }

  // Handle specific follow-ups about agentic AI FIRST (before definition)
  if (message.includes('agentic ai') && (message.includes('companies') || message.includes('use') || message.includes('example') || message.includes('industry'))) {
      return {
          response: "Yes, companies like OpenAI, Anthropic, and Microsoft are actively deploying agentic AI. Examples include coding assistants (Devin), autonomous research agents, and customer support bots that can take actions like processing refunds or booking appointments. The industry is shifting from static chatbots to goal-oriented agents."
      };
  }

  // Handle Generic Agentic AI Definition (Lower Priority)
  // Only trigger if message specifically asks "what is" or is very short/vague
  if (message.includes('agentic ai')) {
     if (message.includes('what') || message.includes('define') || message.includes('explain') || message.length < 30) {
       return {
        response: "Agentic AI refers to systems designed to act autonomously toward goals rather than simply responding to prompts. These systems can plan steps, make decisions, use tools, and adapt their behavior based on feedback. Instead of waiting for continuous user input, an agentic AI can break down a task, execute subtasks, and adjust its approach as conditions change. This makes it useful for workflows like research, scheduling, automation, and multi-step problem solving."
      };
     }
  }

  if (message.includes('tech stack') || message.includes('technologies')) {
       return {
        response: answerQuestionDirectly('tech stack', taskContext),
      };
  }

  // Research/Task Topic Response (Low Priority - Only if message is related to the topic OR vague)
  // Only trigger if the MESSAGE itself contains these keywords, OR if the message is very short/initial
  const isRelatedToTopic = message.includes('intern') || message.includes('frontend') || message.includes('company') || message.includes('hiring');
  const isVague = message.length < 5 || message.includes('summary') || message.includes('help');
  
  if ((isRelatedToTopic || isVague) && (taskContext.includes('intern') || taskContext.includes('frontend'))) {
    // Return ONLY the response. No task_understanding or research_output artifacts.
    return {
      response: generateResearchResponse(input),
    };
  }
  
  // Default: answer the question directly using the message as the primary key
  return {
    response: answerQuestionDirectly(input.chat_input, taskContext),
  };
}

function answerQuestionDirectly(question: string, context: string): string {
  const q = question.toLowerCase();
  const ctx = context.toLowerCase();
  
  // Tech stack questions
  if (q.includes('tech stack') || q.includes('technology') || q.includes('stack') || ctx.includes('tech stack')) {
    return `The modern frontend tech stack centers on React, TypeScript, and Tailwind CSS.

Core components include:
- **Languages**: HTML5, CSS3, JavaScript (ES6+), TypeScript.
- **Frameworks**: React (library), Next.js (meta-framework).
- **Styling**: Tailwind CSS, CSS Modules, or Styled Components.
- **State Management**: React Query (server state), Zustand or Redux (client state).
- **Build Tools**: Vite, Webpack.
- **Testing**: Jest, React Testing Library, Playwright.

For internships, focus on mastering React, TypeScript, and git workflows.`;
  }
  
  // General question - provide direct answer without meta-talk
  if (question.length > 0) {
    // If it's a "what is" question
    if (q.includes('what') || q.includes('explain') || q.includes('tell me')) {
      // Return a direct explanation mock
      return `${question} involves defining clear objectives and executing a structured plan. It typically requires gathering resources, analyzing requirements, and iterating on solutions.`;
    }
    
    // If it's a "how to" question
    if (q.includes('how')) {
      return `To achieve this, start by analyzing the requirements. Then, break the task into smaller steps, execute them sequentially, and review the results. Continuous testing and refinement are key to success.`;
    }
    
    // Default fallback
    return `${question} is a valid query. It requires a specific approach depending on the context, usually involving research, planning, and execution.`;
  }
  
  // Fallback
  return `This topic requires a structured approach involving analysis, planning, and execution.`;
}

function generateInitialTaskResponse(input: LangflowChatInput): string {
  // Use the same logic as chat response for consistency
  const response = generateMockChatResponse(input);
  return response.response || '';
}

function generateResearchResponse(input: LangflowChatInput): string {
  const message = input.chat_input.toLowerCase();
  const fullContext = `${input.task_title} ${input.task_description} ${input.chat_input}`.toLowerCase();
  
  if (fullContext.includes('frontend') && (fullContext.includes('intern') || fullContext.includes('job'))) {
    return `Companies hiring for frontend roles include Google (Summer 2025), Meta (Rolling), Microsoft, and Amazon.

Success requires:
1. **Strong Portfolio**: 3-5 projects using React.
2. **Technical Skills**: JavaScript (ES6+), TypeScript, CSS/Tailwind.
3. **Fundamentals**: Data structures, algorithms, and system design basics.

Apply 6-9 months in advance for major tech companies.`;
  }
  
  if (fullContext.includes('tech stack')) {
    return answerQuestionDirectly('tech stack', fullContext);
  }
  
  // General research fallback - Direct answer
  return `Major tech companies and startups regularly hire for this role. Key requirements typically include relevant technical skills, problem-solving ability, and cultural fit. Check company career pages and LinkedIn for current openings.`;
}


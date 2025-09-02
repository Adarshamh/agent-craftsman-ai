import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TaskExecutionRequest {
  taskId?: string;
  prompt: string;
  context?: {
    knowledgePatterns?: any[];
    userStats?: any;
    previousTasks?: any[];
  };
  executionType: 'analysis' | 'generation' | 'problem_solving' | 'optimization';
}

interface KnowledgePattern {
  pattern_type: string;
  pattern_name: string;
  description: string;
  pattern_data: any;
  effectiveness_score?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const {
      taskId,
      prompt,
      context = {},
      executionType
    }: TaskExecutionRequest = await req.json();

    console.log(`Processing ${executionType} task for user ${user.id}`);

    // Build intelligent context from user's knowledge patterns and history
    const contextPrompt = await buildContextualPrompt(supabase, user.id, prompt, context, executionType);
    
    // Execute AI task with optimized parameters based on execution type
    const result = await executeAITask(openAIApiKey, contextPrompt, executionType);
    
    // Extract and store new knowledge patterns
    const knowledgePatterns = extractKnowledgePatterns(result, executionType);
    
    // Update task in database if taskId provided
    if (taskId) {
      await updateTaskWithResults(supabase, taskId, result, user.id);
    }
    
    // Store new knowledge patterns
    if (knowledgePatterns.length > 0) {
      await storeKnowledgePatterns(supabase, knowledgePatterns, user.id);
    }
    
    // Update user stats
    await updateUserPerformanceStats(supabase, user.id, result.executionTime, result.success);

    return new Response(JSON.stringify({
      success: true,
      result: result.content,
      executionTime: result.executionTime,
      knowledgePatternsFound: knowledgePatterns.length,
      confidence: result.confidence,
      suggestions: result.suggestions
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Agent error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function buildContextualPrompt(
  supabase: any, 
  userId: string, 
  prompt: string, 
  context: any, 
  executionType: string
): Promise<string> {
  // Get user's knowledge patterns
  const { data: patterns } = await supabase
    .from('knowledge_patterns')
    .select('*')
    .eq('user_id', userId)
    .order('effectiveness_score', { ascending: false })
    .limit(5);

  // Get recent successful tasks
  const { data: recentTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(3);

  // Build contextual system prompt
  let systemPrompt = `You are an advanced AI agent specialized in ${executionType}. 

EXECUTION TYPE: ${executionType.toUpperCase()}

CONTEXT INTELLIGENCE:
- User has ${patterns?.length || 0} proven knowledge patterns
- Recent successful tasks: ${recentTasks?.length || 0}
- Optimization focus: ${getOptimizationFocus(executionType)}

KNOWLEDGE PATTERNS:
${patterns?.map(p => `- ${p.pattern_name}: ${p.description} (effectiveness: ${p.effectiveness_score || 'unknown'})`).join('\n') || 'No patterns established yet'}

RECENT SUCCESSES:
${recentTasks?.map(t => `- ${t.title}: ${t.description} (${t.execution_time_ms}ms)`).join('\n') || 'No recent tasks'}

INSTRUCTIONS:
1. Analyze the request using established patterns
2. Provide step-by-step reasoning
3. Suggest optimizations based on user history
4. Include confidence level in your response
5. Recommend new knowledge patterns if discovered
6. Focus on practical, actionable solutions

USER REQUEST: ${prompt}`;

  return systemPrompt;
}

async function executeAITask(apiKey: string, prompt: string, executionType: string) {
  const startTime = Date.now();
  
  const model = getOptimalModel(executionType);
  const requestBody: any = {
    model,
    messages: [
      { role: 'system', content: prompt }
    ]
  };

  // Configure parameters based on model type
  if (model.startsWith('gpt-5') || model.startsWith('gpt-4.1') || model.startsWith('o3') || model.startsWith('o4')) {
    requestBody.max_completion_tokens = 2000;
  } else {
    requestBody.max_tokens = 2000;
    requestBody.temperature = 0.7;
  }

  console.log(`Using model: ${model} for ${executionType}`);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('OpenAI API error:', errorData);
    throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  const executionTime = Date.now() - startTime;
  
  const content = data.choices[0].message.content;
  
  return {
    content,
    executionTime,
    success: true,
    confidence: calculateConfidence(content, executionType),
    suggestions: extractSuggestions(content)
  };
}

function getOptimalModel(executionType: string): string {
  switch (executionType) {
    case 'analysis':
      return 'gpt-4.1-2025-04-14'; // Good for detailed analysis
    case 'generation':
      return 'gpt-5-2025-08-07'; // Best for creative generation
    case 'problem_solving':
      return 'o4-mini-2025-04-16'; // Optimized for reasoning
    case 'optimization':
      return 'gpt-5-mini-2025-08-07'; // Fast and efficient
    default:
      return 'gpt-4.1-2025-04-14';
  }
}

function getOptimizationFocus(executionType: string): string {
  const focuses = {
    analysis: 'thoroughness and accuracy',
    generation: 'creativity and relevance',
    problem_solving: 'logical reasoning and step-by-step solutions',
    optimization: 'efficiency and performance improvements'
  };
  return focuses[executionType as keyof typeof focuses] || 'general problem solving';
}

function calculateConfidence(content: string, executionType: string): number {
  // Simple confidence calculation based on content characteristics
  let confidence = 0.5;
  
  if (content.includes('step-by-step') || content.includes('analysis')) confidence += 0.2;
  if (content.length > 500) confidence += 0.1;
  if (content.includes('recommend') || content.includes('suggest')) confidence += 0.1;
  if (content.includes('confident') || content.includes('certain')) confidence += 0.1;
  
  return Math.min(confidence, 1.0);
}

function extractSuggestions(content: string): string[] {
  const suggestions = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.includes('suggest') || line.includes('recommend') || 
        line.includes('consider') || line.includes('might want to')) {
      suggestions.push(line.trim());
    }
  }
  
  return suggestions.slice(0, 3); // Limit to top 3 suggestions
}

function extractKnowledgePatterns(result: any, executionType: string): KnowledgePattern[] {
  const patterns: KnowledgePattern[] = [];
  const content = result.content;
  
  // Extract patterns based on content analysis
  if (content.includes('pattern') || content.includes('approach') || content.includes('method')) {
    patterns.push({
      pattern_type: executionType,
      pattern_name: `${executionType}_pattern_${Date.now()}`,
      description: `Successful ${executionType} approach extracted from AI response`,
      pattern_data: {
        content: content.substring(0, 500),
        confidence: result.confidence,
        executionTime: result.executionTime,
        timestamp: new Date().toISOString()
      },
      effectiveness_score: result.confidence
    });
  }
  
  return patterns;
}

async function updateTaskWithResults(supabase: any, taskId: string, result: any, userId: string) {
  await supabase
    .from('tasks')
    .update({
      status: result.success ? 'completed' : 'failed',
      completed_at: new Date().toISOString(),
      execution_time_ms: result.executionTime,
      metadata: {
        ai_confidence: result.confidence,
        ai_suggestions: result.suggestions,
        result_length: result.content.length
      }
    })
    .eq('id', taskId)
    .eq('user_id', userId);
}

async function storeKnowledgePatterns(supabase: any, patterns: KnowledgePattern[], userId: string) {
  for (const pattern of patterns) {
    await supabase
      .from('knowledge_patterns')
      .insert({
        ...pattern,
        user_id: userId
      });
  }
}

async function updateUserPerformanceStats(supabase: any, userId: string, executionTime: number, success: boolean) {
  // Get current stats
  const { data: currentStats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  const now = new Date().toISOString();
  
  if (currentStats) {
    // Update existing stats
    await supabase
      .from('user_stats')
      .update({
        total_tasks: currentStats.total_tasks + 1,
        completed_tasks: success ? currentStats.completed_tasks + 1 : currentStats.completed_tasks,
        failed_tasks: success ? currentStats.failed_tasks : currentStats.failed_tasks + 1,
        total_execution_time_ms: currentStats.total_execution_time_ms + executionTime,
        average_response_time_ms: (currentStats.total_execution_time_ms + executionTime) / (currentStats.total_tasks + 1),
        last_activity_at: now,
        updated_at: now
      })
      .eq('user_id', userId);
  } else {
    // Create new stats
    await supabase
      .from('user_stats')
      .insert({
        user_id: userId,
        total_tasks: 1,
        completed_tasks: success ? 1 : 0,
        failed_tasks: success ? 0 : 1,
        total_execution_time_ms: executionTime,
        average_response_time_ms: executionTime,
        last_activity_at: now
      });
  }
}
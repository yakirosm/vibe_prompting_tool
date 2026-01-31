import { NextRequest, NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import type { GeneratedPrompt, AgentId, PromptLength, PromptStrategy } from '@prompt-ops/shared';
import { formatPromptForCopy } from '@/lib/ai/prompt-builder';
import { detectInputLanguage } from '@prompt-ops/shared';
import type { Database } from '@prompt-ops/db';

type PromptInsert = Database['public']['Tables']['prompts']['Insert'];

interface SavePromptRequest {
  input: string;
  agent: AgentId;
  length: PromptLength;
  strategy: PromptStrategy;
  generatedPrompt: GeneratedPrompt;
  tags?: string[];
}

export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: SavePromptRequest = await request.json();
    const { input, agent, length, strategy, generatedPrompt, tags } = body;

    // Validate required fields
    if (!input || !agent || !generatedPrompt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Detect input language
    const inputLanguage = detectInputLanguage(input);

    // Format the output prompt
    const outputPrompt = formatPromptForCopy(generatedPrompt);

    // Prepare insert data
    const insertData: PromptInsert = {
      user_id: user.id,
      agent_profile_id: agent,
      mode_used: 'quick',
      input_raw: input,
      input_language: inputLanguage,
      extracted_fields: {
        goal: generatedPrompt.goal,
        context: generatedPrompt.context,
        currentBehavior: generatedPrompt.currentBehavior,
        expectedBehavior: generatedPrompt.expectedBehavior,
        acceptanceCriteria: generatedPrompt.acceptanceCriteria,
        constraints: generatedPrompt.constraints,
        clarifyingQuestions: generatedPrompt.clarifyingQuestions,
      },
      output_prompt: outputPrompt,
      variant_type: length,
      strategy: strategy,
      tags: tags || null,
    };

    // Save to database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('prompts')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Failed to save prompt:', error);
      return NextResponse.json(
        { error: 'Failed to save prompt' },
        { status: 500 }
      );
    }

    return NextResponse.json({ prompt: data });
  } catch (error) {
    console.error('Error saving prompt:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const search = searchParams.get('search') || '';
    const agent = searchParams.get('agent') || '';
    const strategy = searchParams.get('strategy') || '';
    const tags = searchParams.get('tags') || '';
    const favoritesOnly = searchParams.get('favorites') === 'true';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? true : false;

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('prompts')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // Apply filters
    if (search) {
      query = query.or(`input_raw.ilike.%${search}%,output_prompt.ilike.%${search}%`);
    }
    if (agent) {
      query = query.eq('agent_profile_id', agent);
    }
    if (strategy) {
      query = query.eq('strategy', strategy);
    }
    if (favoritesOnly) {
      query = query.eq('is_favorite', true);
    }
    if (tags) {
      const tagArray = tags.split(',').filter(Boolean);
      if (tagArray.length > 0) {
        query = query.overlaps('tags', tagArray);
      }
    }

    // Apply sorting and pagination
    const { data, error, count } = await query
      .order(sortBy, { ascending: sortOrder })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Failed to fetch prompts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch prompts' },
        { status: 500 }
      );
    }

    return NextResponse.json({ prompts: data, total: count });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

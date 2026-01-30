import { NextRequest, NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';

interface CreateAgentRequest {
  name: string;
  description?: string;
  tone?: string;
  structure_preference?: string;
  emphasis?: string;
  extra_phrase?: string;
  documentation_url?: string;
  custom_instructions?: string;
  icon?: string;
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

    const body: CreateAgentRequest = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Agent name is required' },
        { status: 400 }
      );
    }

    // Create custom agent
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('custom_agents')
      .insert({
        user_id: user.id,
        name: body.name.trim(),
        description: body.description?.trim() || null,
        tone: body.tone?.trim() || null,
        structure_preference: body.structure_preference?.trim() || null,
        emphasis: body.emphasis?.trim() || null,
        extra_phrase: body.extra_phrase?.trim() || null,
        documentation_url: body.documentation_url?.trim() || null,
        custom_instructions: body.custom_instructions?.trim() || null,
        icon: body.icon?.trim() || 'bot',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create custom agent:', error);
      return NextResponse.json(
        { error: 'Failed to create custom agent' },
        { status: 500 }
      );
    }

    return NextResponse.json({ agent: data });
  } catch (error) {
    console.error('Error creating custom agent:', error);
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
    const search = searchParams.get('search') || '';
    const activeOnly = searchParams.get('activeOnly') === 'true';

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('custom_agents')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Filter active only if requested
    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    // Apply sorting
    const { data, error, count } = await query
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch custom agents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch custom agents' },
        { status: 500 }
      );
    }

    return NextResponse.json({ agents: data, total: count });
  } catch (error) {
    console.error('Error fetching custom agents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

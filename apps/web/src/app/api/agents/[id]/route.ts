import { NextRequest, NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';

interface UpdateAgentRequest {
  name?: string;
  description?: string;
  tone?: string;
  structure_preference?: string;
  emphasis?: string;
  extra_phrase?: string;
  documentation_url?: string;
  custom_instructions?: string;
  icon?: string;
  is_active?: boolean;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch the custom agent
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: agent, error } = await (supabase as any)
      .from('custom_agents')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !agent) {
      return NextResponse.json(
        { error: 'Custom agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ agent });
  } catch (error) {
    console.error('Error fetching custom agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: UpdateAgentRequest = await request.json();
    const updateData: Record<string, unknown> = {};

    // Only allow updating specific fields
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.tone !== undefined) updateData.tone = body.tone?.trim() || null;
    if (body.structure_preference !== undefined) updateData.structure_preference = body.structure_preference?.trim() || null;
    if (body.emphasis !== undefined) updateData.emphasis = body.emphasis?.trim() || null;
    if (body.extra_phrase !== undefined) updateData.extra_phrase = body.extra_phrase?.trim() || null;
    if (body.documentation_url !== undefined) updateData.documentation_url = body.documentation_url?.trim() || null;
    if (body.custom_instructions !== undefined) updateData.custom_instructions = body.custom_instructions?.trim() || null;
    if (body.icon !== undefined) updateData.icon = body.icon?.trim() || 'bot';
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update the custom agent
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('custom_agents')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update custom agent:', error);
      return NextResponse.json(
        { error: 'Failed to update custom agent' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Custom agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ agent: data });
  } catch (error) {
    console.error('Error updating custom agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete the custom agent
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('custom_agents')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to delete custom agent:', error);
      return NextResponse.json(
        { error: 'Failed to delete custom agent' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting custom agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

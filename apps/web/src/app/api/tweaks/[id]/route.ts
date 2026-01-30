import { NextRequest, NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';

interface UpdateTweakRequest {
  name?: string;
  short_name?: string;
  instruction?: string;
  description?: string;
  category?: 'skill' | 'behavior' | 'custom';
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

    // Fetch the custom tweak
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tweak, error } = await (supabase as any)
      .from('custom_tweaks')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !tweak) {
      return NextResponse.json(
        { error: 'Custom tweak not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tweak });
  } catch (error) {
    console.error('Error fetching custom tweak:', error);
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

    const body: UpdateTweakRequest = await request.json();
    const updateData: Record<string, unknown> = {};

    // Only allow updating specific fields
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.short_name !== undefined) {
      if (body.short_name.trim().length > 15) {
        return NextResponse.json(
          { error: 'Short name must be 15 characters or less' },
          { status: 400 }
        );
      }
      updateData.short_name = body.short_name.trim();
    }
    if (body.instruction !== undefined) updateData.instruction = body.instruction.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.icon !== undefined) updateData.icon = body.icon?.trim() || 'sparkles';
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update the custom tweak
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('custom_tweaks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update custom tweak:', error);
      return NextResponse.json(
        { error: 'Failed to update custom tweak' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Custom tweak not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tweak: data });
  } catch (error) {
    console.error('Error updating custom tweak:', error);
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

    // Delete the custom tweak
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('custom_tweaks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to delete custom tweak:', error);
      return NextResponse.json(
        { error: 'Failed to delete custom tweak' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting custom tweak:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

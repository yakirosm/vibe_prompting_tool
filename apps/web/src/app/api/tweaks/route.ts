import { NextRequest, NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';

interface CreateTweakRequest {
  name: string;
  short_name: string;
  instruction: string;
  description?: string;
  category?: 'skill' | 'behavior' | 'custom';
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

    const body: CreateTweakRequest = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Tweak name is required' },
        { status: 400 }
      );
    }

    if (!body.short_name?.trim()) {
      return NextResponse.json(
        { error: 'Short name is required' },
        { status: 400 }
      );
    }

    if (!body.instruction?.trim()) {
      return NextResponse.json(
        { error: 'Instruction is required' },
        { status: 400 }
      );
    }

    // Validate short_name length
    if (body.short_name.trim().length > 15) {
      return NextResponse.json(
        { error: 'Short name must be 15 characters or less' },
        { status: 400 }
      );
    }

    // Create custom tweak
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('custom_tweaks')
      .insert({
        user_id: user.id,
        name: body.name.trim(),
        short_name: body.short_name.trim(),
        instruction: body.instruction.trim(),
        description: body.description?.trim() || null,
        category: body.category || 'custom',
        icon: body.icon?.trim() || 'sparkles',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create custom tweak:', error);
      return NextResponse.json(
        { error: 'Failed to create custom tweak' },
        { status: 500 }
      );
    }

    return NextResponse.json({ tweak: data });
  } catch (error) {
    console.error('Error creating custom tweak:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured) {
    // Return empty array when database is not configured
    return NextResponse.json({ tweaks: [], total: 0 });
  }

  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      // Return empty array for unauthenticated users (graceful degradation)
      return NextResponse.json({ tweaks: [], total: 0 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const activeOnly = searchParams.get('activeOnly') === 'true';

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('custom_tweaks')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,short_name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Filter active only if requested
    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    // Apply sorting
    const { data, error, count } = await query
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch custom tweaks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch custom tweaks' },
        { status: 500 }
      );
    }

    return NextResponse.json({ tweaks: data, total: count });
  } catch (error) {
    console.error('Error fetching custom tweaks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

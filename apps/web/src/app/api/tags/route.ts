import { NextRequest, NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';

interface CreateTagRequest {
  name: string;
  color?: string;
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

    const body: CreateTagRequest = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }

    // Create tag
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('tags')
      .insert({
        user_id: user.id,
        name: body.name.trim(),
        color: body.color?.trim() || '#6366f1',
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create tag:', error);
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A tag with this name already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create tag' },
        { status: 500 }
      );
    }

    return NextResponse.json({ tag: data });
  } catch (error) {
    console.error('Error creating tag:', error);
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
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('tags')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // Apply search filter
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Apply sorting for non-usage sorts
    if (sortBy !== 'usage') {
      const ascending = sortOrder === 'asc';
      query = query.order(sortBy, { ascending });
    } else {
      // For usage sort, we'll sort after calculating usage counts
      query = query.order('created_at', { ascending: false });
    }

    const { data: tags, error, count } = await query;

    if (error) {
      console.error('Failed to fetch tags:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tags' },
        { status: 500 }
      );
    }

    // Fetch prompts to calculate usage counts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: prompts } = await (supabase as any)
      .from('prompts')
      .select('tags')
      .eq('user_id', user.id)
      .not('tags', 'is', null);

    // Calculate usage counts for each tag
    const usageCounts: Record<string, number> = {};
    if (prompts) {
      for (const prompt of prompts) {
        if (Array.isArray(prompt.tags)) {
          for (const tagName of prompt.tags) {
            usageCounts[tagName] = (usageCounts[tagName] || 0) + 1;
          }
        }
      }
    }

    // Add usage_count to each tag
    const tagsWithUsage = tags.map((tag: { name: string }) => ({
      ...tag,
      usage_count: usageCounts[tag.name] || 0,
    }));

    // Sort by usage if requested
    if (sortBy === 'usage') {
      tagsWithUsage.sort((a: { usage_count: number }, b: { usage_count: number }) => {
        return sortOrder === 'desc'
          ? b.usage_count - a.usage_count
          : a.usage_count - b.usage_count;
      });
    }

    return NextResponse.json({ tags: tagsWithUsage, total: count });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

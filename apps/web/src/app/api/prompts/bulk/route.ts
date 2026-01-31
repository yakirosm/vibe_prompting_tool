import { NextRequest, NextResponse } from 'next/server';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';

interface BulkTagRequest {
  promptIds: string[];
  action: 'add' | 'remove';
  tags: string[];
}

export async function PATCH(request: NextRequest) {
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

    const body: BulkTagRequest = await request.json();

    if (!Array.isArray(body.promptIds) || body.promptIds.length === 0) {
      return NextResponse.json(
        { error: 'promptIds is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.tags) || body.tags.length === 0) {
      return NextResponse.json(
        { error: 'tags is required and must be a non-empty array' },
        { status: 400 }
      );
    }

    if (body.action !== 'add' && body.action !== 'remove') {
      return NextResponse.json(
        { error: 'action must be "add" or "remove"' },
        { status: 400 }
      );
    }

    // Fetch the prompts to update
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: prompts, error: fetchError } = await (supabase as any)
      .from('prompts')
      .select('id, tags')
      .eq('user_id', user.id)
      .in('id', body.promptIds);

    if (fetchError) {
      console.error('Failed to fetch prompts:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch prompts' },
        { status: 500 }
      );
    }

    // Update each prompt's tags
    const updates = prompts.map((prompt: { id: string; tags: string[] | null }) => {
      const currentTags = prompt.tags || [];
      let newTags: string[];

      if (body.action === 'add') {
        // Add tags that aren't already present
        const tagsToAdd = body.tags.filter((tag) => !currentTags.includes(tag));
        newTags = [...currentTags, ...tagsToAdd];
      } else {
        // Remove specified tags
        newTags = currentTags.filter((tag) => !body.tags.includes(tag));
      }

      return {
        id: prompt.id,
        tags: newTags,
      };
    });

    // Perform batch update
    let updatedCount = 0;
    for (const update of updates) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase as any)
        .from('prompts')
        .update({ tags: update.tags })
        .eq('id', update.id)
        .eq('user_id', user.id);

      if (!updateError) {
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      message: `${updatedCount} prompt${updatedCount !== 1 ? 's' : ''} updated`
    });
  } catch (error) {
    console.error('Error in bulk tag update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

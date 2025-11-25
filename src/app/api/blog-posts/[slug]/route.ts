import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogPosts } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  context: { params: { slug: string } }
) {
  try {
    const slug = context.params.slug;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required', code: 'MISSING_SLUG' },
        { status: 400 }
      );
    }

    // Query for published post by slug
    const post = await db
      .select()
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.slug, slug),
          eq(blogPosts.status, 'published')
        )
      )
      .limit(1);

    if (post.length === 0) {
      return NextResponse.json(
        { error: 'Post not found or not published', code: 'POST_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Increment views count
    await db
      .update(blogPosts)
      .set({ views: sql`${blogPosts.views} + 1` })
      .where(eq(blogPosts.slug, slug));

    // Get updated post with new views count
    const updatedPost = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    // Prepare response without author_id
    const response = {
      id: updatedPost[0].id,
      title: updatedPost[0].title,
      slug: updatedPost[0].slug,
      excerpt: updatedPost[0].excerpt,
      content: updatedPost[0].content,
      image_url: updatedPost[0].image_url,
      author_name: updatedPost[0].author_name,
      category: updatedPost[0].category,
      views: updatedPost[0].views,
      published_at: updatedPost[0].published_at,
      created_at: updatedPost[0].created_at
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogPosts } from '@/db/schema';
import { eq, like, and, desc, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const categoryFilter = searchParams.get('category');
    const searchQuery = searchParams.get('search');

    // Build conditions array
    const conditions = [eq(blogPosts.status, 'published')];

    // Add category filter if provided
    if (categoryFilter) {
      conditions.push(eq(blogPosts.category, categoryFilter));
    }

    // Add search filter if provided
    if (searchQuery) {
      conditions.push(like(blogPosts.title, `%${searchQuery}%`));
    }

    // Combine all conditions
    const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];

    // Get total count of matching posts
    const totalResult = await db
      .select({ count: count() })
      .from(blogPosts)
      .where(whereCondition);

    const total = totalResult[0]?.count ?? 0;

    // Get paginated posts
    const posts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        content: blogPosts.content,
        image_url: blogPosts.image_url,
        author_name: blogPosts.author_name,
        category: blogPosts.category,
        views: blogPosts.views,
        published_at: blogPosts.published_at,
        created_at: blogPosts.created_at
      })
      .from(blogPosts)
      .where(whereCondition)
      .orderBy(desc(blogPosts.published_at))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      posts,
      total
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
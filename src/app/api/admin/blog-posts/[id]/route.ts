import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogPosts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const postId = parseInt(id);

    // Parse request body
    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      image_url,
      category,
      status,
      author_name
    } = body;

    // Validate status if provided
    if (status && !['draft', 'published'].includes(status)) {
      return NextResponse.json(
        {
          error: 'Status must be either "draft" or "published"',
          code: 'INVALID_STATUS'
        },
        { status: 400 }
      );
    }

    // Check if post exists
    const existingPost = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.id, postId))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Build update object with only provided fields
    const updates: Record<string, any> = {};

    if (title !== undefined) updates.title = title.trim();
    if (slug !== undefined) updates.slug = slug.trim().toLowerCase();
    if (excerpt !== undefined) updates.excerpt = excerpt.trim();
    if (content !== undefined) updates.content = content;
    if (image_url !== undefined) updates.image_url = image_url.trim();
    if (category !== undefined) updates.category = category.trim();
    if (author_name !== undefined) updates.author_name = author_name.trim();
    if (status !== undefined) updates.status = status;

    // Special handling for status change to 'published'
    if (status === 'published' && !existingPost[0].published_at) {
      updates.published_at = new Date().toISOString();
    }

    // Always update updatedAt
    updates.updatedAt = new Date().toISOString();

    // Perform update
    const updated = await db.update(blogPosts)
      .set(updates)
      .where(eq(blogPosts.id, postId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });

  } catch (error: any) {
    console.error('PATCH error:', error);

    // Handle unique constraint violation for slug
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json(
        {
          error: 'A blog post with this slug already exists',
          code: 'DUPLICATE_SLUG'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    const postId = parseInt(id);

    // Check if post exists
    const existingPost = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.id, postId))
      .limit(1);

    if (existingPost.length === 0) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Delete the post
    const deleted = await db.delete(blogPosts)
      .where(eq(blogPosts.id, postId))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Blog post deleted successfully',
        id: postId,
        post: deleted[0]
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error.message 
      },
      { status: 500 }
    );
  }
}
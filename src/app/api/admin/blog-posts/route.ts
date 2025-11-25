import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogPosts } from '@/db/schema';
import { eq, like, and, desc, count, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Build where conditions
    const conditions = [];
    
    if (status) {
      conditions.push(eq(blogPosts.status, status));
    }
    
    if (category) {
      conditions.push(eq(blogPosts.category, category));
    }
    
    if (search) {
      conditions.push(like(blogPosts.title, `%${search}%`));
    }

    // Build query
    let query = db.select().from(blogPosts);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const posts = await query
      .orderBy(desc(blogPosts.created_at))
      .limit(limit)
      .offset(offset);

    // Get total count
    let countQuery = db.select({ value: count() }).from(blogPosts);
    
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    
    const totalResult = await countQuery;
    const total = totalResult[0]?.value ?? 0;

    return NextResponse.json({
      posts,
      total
    }, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Validate required fields
    if (!title || !title.trim()) {
      return NextResponse.json({ 
        error: "Title is required",
        code: "MISSING_TITLE" 
      }, { status: 400 });
    }

    if (!slug || !slug.trim()) {
      return NextResponse.json({ 
        error: "Slug is required",
        code: "MISSING_SLUG" 
      }, { status: 400 });
    }

    if (!author_name || !author_name.trim()) {
      return NextResponse.json({ 
        error: "Author name is required",
        code: "MISSING_AUTHOR_NAME" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedTitle = title.trim();
    const sanitizedSlug = slug.trim().toLowerCase();
    const sanitizedAuthorName = author_name.trim();

    // Validate slug format (alphanumeric + hyphens)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(sanitizedSlug)) {
      return NextResponse.json({ 
        error: "Slug must contain only lowercase letters, numbers, and hyphens",
        code: "INVALID_SLUG_FORMAT" 
      }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['draft', 'published'];
    const finalStatus = status || 'draft';
    
    if (!validStatuses.includes(finalStatus)) {
      return NextResponse.json({ 
        error: "Status must be 'draft' or 'published'",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Check for duplicate slug
    const existingPost = await db.select()
      .from(blogPosts)
      .where(eq(blogPosts.slug, sanitizedSlug))
      .limit(1);

    if (existingPost.length > 0) {
      return NextResponse.json({ 
        error: "A blog post with this slug already exists",
        code: "DUPLICATE_SLUG" 
      }, { status: 400 });
    }

    // Generate timestamps
    const now = new Date().toISOString();
    
    // Prepare insert data
    const insertData: {
      title: string;
      slug: string;
      excerpt?: string;
      content?: string;
      image_url?: string;
      author_name: string;
      category?: string;
      status: string;
      views: number;
      published_at?: string;
      created_at: string;
      updated_at: string;
    } = {
      title: sanitizedTitle,
      slug: sanitizedSlug,
      author_name: sanitizedAuthorName,
      status: finalStatus,
      views: 0,
      created_at: now,
      updated_at: now
    };

    // Add optional fields if provided
    if (excerpt !== undefined && excerpt !== null) {
      insertData.excerpt = excerpt;
    }
    
    if (content !== undefined && content !== null) {
      insertData.content = content;
    }
    
    if (image_url !== undefined && image_url !== null) {
      insertData.image_url = image_url;
    }
    
    if (category !== undefined && category !== null) {
      insertData.category = category;
    }

    // Set published_at if status is published
    if (finalStatus === 'published') {
      insertData.published_at = now;
    }

    // Insert into database
    const newPost = await db.insert(blogPosts)
      .values(insertData)
      .returning();

    return NextResponse.json(newPost[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    
    // Check for unique constraint violation
    if ((error as Error).message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: "A blog post with this slug already exists",
        code: "DUPLICATE_SLUG" 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}
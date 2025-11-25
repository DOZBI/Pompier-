import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { houses, user } from '@/db/schema';
import { eq, like, or, and, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Build the WHERE conditions
    const conditions = [];

    // Status filter
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      conditions.push(eq(houses.status, status));
    }

    // Search filter across user name, address, and city
    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          like(user.name, searchTerm),
          like(houses.address, searchTerm),
          like(houses.city, searchTerm)
        )
      );
    }

    // Combine conditions with AND if multiple exist
    const whereClause = conditions.length > 0 
      ? and(...conditions) 
      : undefined;

    // Query houses with user data
    const results = await db
      .select({
        id: houses.id,
        user_id: houses.user_id,
        address: houses.address,
        city: houses.city,
        state: houses.state,
        zip_code: houses.zip_code,
        status: houses.status,
        photos_urls: houses.photos_urls,
        documents_urls: houses.documents_urls,
        plan_url: houses.plan_url,
        plan_analysis: houses.plan_analysis,
        created_at: houses.created_at,
        updated_at: houses.updated_at,
        user_id_ref: user.id,
        user_name: user.name,
        user_email: user.email,
        user_role: user.role,
      })
      .from(houses)
      .leftJoin(user, eq(houses.user_id, user.id))
      .where(whereClause)
      .orderBy(desc(houses.created_at))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const countQuery = await db
      .select({ count: sql<number>`count(*)` })
      .from(houses)
      .leftJoin(user, eq(houses.user_id, user.id))
      .where(whereClause);

    const total = countQuery[0]?.count || 0;

    // Format response with parsed JSON fields and user object
    const formattedHouses = results.map(house => {
      // Parse JSON fields
      let photosUrls = [];
      let documentsUrls = [];
      let planAnalysis = null;

      try {
        photosUrls = house.photos_urls ? JSON.parse(house.photos_urls) : [];
      } catch (e) {
        console.error('Error parsing photos_urls:', e);
      }

      try {
        documentsUrls = house.documents_urls ? JSON.parse(house.documents_urls) : [];
      } catch (e) {
        console.error('Error parsing documents_urls:', e);
      }

      try {
        planAnalysis = house.plan_analysis ? JSON.parse(house.plan_analysis) : null;
      } catch (e) {
        console.error('Error parsing plan_analysis:', e);
      }

      return {
        id: house.id,
        user_id: house.user_id,
        address: house.address,
        city: house.city,
        state: house.state,
        zip_code: house.zip_code,
        status: house.status,
        photos_urls: photosUrls,
        documents_urls: documentsUrls,
        plan_url: house.plan_url,
        plan_analysis: planAnalysis,
        created_at: house.created_at,
        updated_at: house.updated_at,
        user: house.user_id_ref ? {
          id: house.user_id_ref,
          name: house.user_name,
          email: house.user_email,
          role: house.user_role,
        } : null,
      };
    });

    return NextResponse.json({
      houses: formattedHouses,
      total,
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}
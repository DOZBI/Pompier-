import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { houses, user } from '@/db/schema';
import { eq, gte, lt, and, isNotNull, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Calculate date thresholds
    const now = Date.now();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    const sixtyDaysAgo = new Date(now - 60 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgoUnix = Math.floor((now - 30 * 24 * 60 * 60 * 1000) / 1000);
    const sixtyDaysAgoUnix = Math.floor((now - 60 * 24 * 60 * 60 * 1000) / 1000);

    // 1. Total houses count
    const totalHousesResult = await db.select({ count: sql<number>`count(*)` })
      .from(houses);
    const totalHouses = totalHousesResult[0]?.count || 0;

    // 2. Total users count
    const totalUsersResult = await db.select({ count: sql<number>`count(*)` })
      .from(user);
    const totalUsers = totalUsersResult[0]?.count || 0;

    // 3. Pending houses count
    const pendingHousesResult = await db.select({ count: sql<number>`count(*)` })
      .from(houses)
      .where(eq(houses.status, 'pending'));
    const pendingHouses = pendingHousesResult[0]?.count || 0;

    // 4. Approved houses count
    const approvedHousesResult = await db.select({ count: sql<number>`count(*)` })
      .from(houses)
      .where(eq(houses.status, 'approved'));
    const approvedHouses = approvedHousesResult[0]?.count || 0;

    // 5. Houses with analysis count
    const housesWithAnalysisResult = await db.select({ count: sql<number>`count(*)` })
      .from(houses)
      .where(isNotNull(houses.plan_analysis));
    const housesWithAnalysis = housesWithAnalysisResult[0]?.count || 0;

    // 6. Recent houses (last 5) with user details
    const recentHousesRaw = await db.select({
      id: houses.id,
      address: houses.address,
      city: houses.city,
      status: houses.status,
      created_at: houses.created_at,
      userName: user.name,
      userEmail: user.email,
    })
      .from(houses)
      .leftJoin(user, eq(houses.user_id, user.id))
      .orderBy(desc(houses.created_at))
      .limit(5);

    const recentHouses = recentHousesRaw.map(house => ({
      id: house.id,
      address: house.address,
      city: house.city,
      status: house.status,
      created_at: house.created_at,
      user: {
        name: house.userName,
        email: house.userEmail,
      },
    }));

    // 7. Growth calculations

    // Houses growth - current period (last 30 days)
    const currentHousesResult = await db.select({ count: sql<number>`count(*)` })
      .from(houses)
      .where(gte(houses.created_at, thirtyDaysAgo));
    const currentHousesCount = currentHousesResult[0]?.count || 0;

    // Houses growth - previous period (30-60 days ago)
    const previousHousesResult = await db.select({ count: sql<number>`count(*)` })
      .from(houses)
      .where(and(
        gte(houses.created_at, sixtyDaysAgo),
        lt(houses.created_at, thirtyDaysAgo)
      ));
    const previousHousesCount = previousHousesResult[0]?.count || 0;

    // Calculate houses growth percentage
    let housesGrowth = 0;
    if (previousHousesCount > 0) {
      housesGrowth = Math.round(((currentHousesCount - previousHousesCount) / previousHousesCount * 100) * 10) / 10;
    } else if (currentHousesCount > 0) {
      housesGrowth = 100;
    }

    // Users growth - current period (last 30 days)
    const currentUsersResult = await db.select({ count: sql<number>`count(*)` })
      .from(user)
      .where(gte(user.created_at, thirtyDaysAgoUnix));
    const currentUsersCount = currentUsersResult[0]?.count || 0;

    // Users growth - previous period (30-60 days ago)
    const previousUsersResult = await db.select({ count: sql<number>`count(*)` })
      .from(user)
      .where(and(
        gte(user.created_at, sixtyDaysAgoUnix),
        lt(user.created_at, thirtyDaysAgoUnix)
      ));
    const previousUsersCount = previousUsersResult[0]?.count || 0;

    // Calculate users growth percentage
    let usersGrowth = 0;
    if (previousUsersCount > 0) {
      usersGrowth = Math.round(((currentUsersCount - previousUsersCount) / previousUsersCount * 100) * 10) / 10;
    } else if (currentUsersCount > 0) {
      usersGrowth = 100;
    }

    return NextResponse.json({
      totalHouses,
      totalUsers,
      pendingHouses,
      approvedHouses,
      housesWithAnalysis,
      recentHouses,
      growth: {
        houses: housesGrowth,
        users: usersGrowth,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
    }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { houses, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const result = await db
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
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
      .from(houses)
      .leftJoin(user, eq(houses.user_id, user.id))
      .where(eq(houses.id, parseInt(id)))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'House not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const house = result[0];

    const parsedHouse = {
      ...house,
      photos_urls: house.photos_urls
        ? JSON.parse(house.photos_urls as string)
        : [],
      documents_urls: house.documents_urls
        ? JSON.parse(house.documents_urls as string)
        : [],
      plan_analysis: house.plan_analysis
        ? JSON.parse(house.plan_analysis as string)
        : null,
    };

    return NextResponse.json(parsedHouse, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required', code: 'MISSING_REQUIRED_FIELD' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: 'Invalid status. Must be one of: pending, approved, rejected',
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    const checkHouse = await db
      .select()
      .from(houses)
      .where(eq(houses.id, parseInt(id)))
      .limit(1);

    if (checkHouse.length === 0) {
      return NextResponse.json(
        { error: 'House not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const updated = await db
      .update(houses)
      .set({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .where(eq(houses.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'House not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const updatedHouse = updated[0];

    const parsedHouse = {
      ...updatedHouse,
      photos_urls: updatedHouse.photos_urls
        ? JSON.parse(updatedHouse.photos_urls as string)
        : [],
      documents_urls: updatedHouse.documents_urls
        ? JSON.parse(updatedHouse.documents_urls as string)
        : [],
      plan_analysis: updatedHouse.plan_analysis
        ? JSON.parse(updatedHouse.plan_analysis as string)
        : null,
    };

    return NextResponse.json(parsedHouse, { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const deleted = await db
      .delete(houses)
      .where(eq(houses.id, parseInt(id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'House not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'House deleted successfully',
        id: parseInt(id),
        deleted: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
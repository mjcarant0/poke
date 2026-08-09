import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    const body = await req.json();

    if (typeof body.isArchived !== 'boolean') {
      return NextResponse.json(
        { error: 'isArchived (boolean) is required' },
        { status: 400 }
      );
    }

    const updatedPost = await prisma.projectPost.update({
      where: { id: postId },
      data: { isArchived: body.isArchived } as any,
    });

    return NextResponse.json(updatedPost);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update project post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;

    await prisma.projectPost.delete({
      where: { id: postId },
    });

    return NextResponse.json({ success: true, message: 'Project post deleted permanently' });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to delete project post' },
      { status: 500 }
    );
  }
}

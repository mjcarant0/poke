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

    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "ProjectPost" ADD COLUMN IF NOT EXISTS "isArchived" BOOLEAN NOT NULL DEFAULT false;`);
    } catch (e) {
      // Ignore column creation error
    }

    const currentUser = await getAuthenticatedUser(req);
    const existingPost = await prisma.projectPost.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (
      currentUser &&
      existingPost.authorId &&
      existingPost.authorId !== currentUser.userId &&
      existingPost.authorEmail?.toLowerCase() !== currentUser.email?.toLowerCase()
    ) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the project owner can archive this post' },
        { status: 403 }
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
    const currentUser = await getAuthenticatedUser(req);

    const existingPost = await prisma.projectPost.findUnique({
      where: { id: postId },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (
      currentUser &&
      existingPost.authorId &&
      existingPost.authorId !== currentUser.userId &&
      existingPost.authorEmail?.toLowerCase() !== currentUser.email?.toLowerCase()
    ) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the project owner can delete this post' },
        { status: 403 }
      );
    }

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

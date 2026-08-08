import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthenticatedUser(req);
    if (!session) {
      return NextResponse.json(
        { error: 'You must log in to upvote QA comments.' },
        { status: 401 }
      );
    }

    const commentId = params.id;
    const comment = await prisma.qAComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return NextResponse.json({ error: 'QA comment report not found.' }, { status: 404 });
    }

    if (comment.authorId && comment.authorId === session.userId) {
      return NextResponse.json(
        { error: 'You cannot upvote your own comment.' },
        { status: 403 }
      );
    }

    const updated = await prisma.qAComment.update({
      where: { id: commentId },
      data: {
        upvotes: { increment: 1 },
      },
    });
    return NextResponse.json({ success: true, upvotes: updated.upvotes });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

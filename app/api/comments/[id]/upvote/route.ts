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

    // Prevent self-upvoting comments
    if (comment.authorId && comment.authorId === session.userId) {
      return NextResponse.json(
        { error: 'You cannot upvote your own comment.' },
        { status: 403 }
      );
    }

    // Check if user already upvoted this comment
    const existingUpvote = await prisma.commentUpvote.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId: session.userId,
        },
      },
    });

    let hasUpvoted = false;
    let newUpvotesCount = comment.upvotes;

    if (existingUpvote) {
      // Cancel/Remove upvote
      await prisma.commentUpvote.delete({
        where: { id: existingUpvote.id },
      });
      const updated = await prisma.qAComment.update({
        where: { id: commentId },
        data: { upvotes: { decrement: 1 } },
      });
      newUpvotesCount = Math.max(0, updated.upvotes);
      hasUpvoted = false;
    } else {
      // Add upvote
      await prisma.commentUpvote.create({
        data: {
          commentId,
          userId: session.userId,
        },
      });
      const updated = await prisma.qAComment.update({
        where: { id: commentId },
        data: { upvotes: { increment: 1 } },
      });
      newUpvotesCount = updated.upvotes;
      hasUpvoted = true;
    }

    return NextResponse.json({ success: true, upvotes: newUpvotesCount, hasUpvoted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

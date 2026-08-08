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
        { error: 'You must log in to upvote posts.' },
        { status: 401 }
      );
    }

    const postId = params.id;
    const post = await prisma.projectPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: 'Project post not found.' }, { status: 404 });
    }

    // Prevent self-upvoting
    if (
      (post.authorId && post.authorId === session.userId) ||
      (post.authorEmail && post.authorEmail.toLowerCase() === session.email.toLowerCase())
    ) {
      return NextResponse.json(
        { error: 'You cannot upvote your own post.' },
        { status: 403 }
      );
    }

    // Check if user already upvoted this post
    const existingUpvote = await prisma.postUpvote.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: session.userId,
        },
      },
    });

    let hasUpvoted = false;
    let newUpvotesCount = post.upvotes;

    if (existingUpvote) {
      // User pressed upvote again -> REMOVE/CANCEL UPVOTE (decrease count by 1)
      await prisma.postUpvote.delete({
        where: { id: existingUpvote.id },
      });
      const updated = await prisma.projectPost.update({
        where: { id: postId },
        data: { upvotes: { decrement: 1 } },
      });
      newUpvotesCount = Math.max(0, updated.upvotes);
      hasUpvoted = false;
    } else {
      // User upvoted for the first time -> ADD UPVOTE (increase count by 1)
      await prisma.postUpvote.create({
        data: {
          postId,
          userId: session.userId,
        },
      });
      const updated = await prisma.projectPost.update({
        where: { id: postId },
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

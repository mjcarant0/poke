import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;
    const replies = await prisma.qAReply.findMany({
      where: { commentId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(replies);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch comment replies' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;
    const body = await req.json();
    const { content, authorName, authorRole } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Reply content cannot be empty.' },
        { status: 400 }
      );
    }

    // Verify if comment exists
    const parentComment = await prisma.qAComment.findUnique({
      where: { id: commentId },
    });

    if (!parentComment) {
      return NextResponse.json(
        { error: 'Parent QA comment report not found.' },
        { status: 404 }
      );
    }

    // Determine author info from session if present
    const authUser = await getAuthenticatedUser(req);
    let finalAuthorName = authorName || 'Reviewer';
    let finalAuthorRole = authorRole || 'REVIEWER';

    if (authUser) {
      finalAuthorName = `@${authUser.username} (Developer)`;
      finalAuthorRole = 'DEVELOPER';
    }

    const newReply = await prisma.qAReply.create({
      data: {
        commentId,
        content: content.trim(),
        authorName: finalAuthorName,
        authorRole: finalAuthorRole,
      },
    });

    return NextResponse.json(newReply, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to submit reply' },
      { status: 500 }
    );
  }
}

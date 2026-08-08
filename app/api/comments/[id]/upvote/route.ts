import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MOCK_QA_COMMENTS } from '@/lib/mock-data';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;

    try {
      const updated = await prisma.qAComment.update({
        where: { id: commentId },
        data: {
          upvotes: { increment: 1 },
        },
      });
      return NextResponse.json({ success: true, upvotes: updated.upvotes });
    } catch (dbErr) {
      const comment = MOCK_QA_COMMENTS.find((c) => c.id === commentId);
      if (comment) {
        comment.upvotes += 1;
        return NextResponse.json({ success: true, upvotes: comment.upvotes });
      }
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

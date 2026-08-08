import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MOCK_QA_COMMENTS } from '@/lib/mock-data';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;
    const body = await req.json();
    const { status } = body;

    try {
      const updated = await prisma.qAComment.update({
        where: { id: commentId },
        data: {
          ...(status ? { status } : {}),
        },
      });

      return NextResponse.json({ success: true, comment: updated });
    } catch (dbErr) {
      const itemIndex = MOCK_QA_COMMENTS.findIndex((c) => c.id === commentId);
      if (itemIndex !== -1) {
        if (status) MOCK_QA_COMMENTS[itemIndex].status = status;
        MOCK_QA_COMMENTS[itemIndex].updatedAt = new Date().toISOString();
        return NextResponse.json({ success: true, comment: MOCK_QA_COMMENTS[itemIndex] });
      }
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

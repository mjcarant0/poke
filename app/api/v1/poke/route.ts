import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      postId = 'post_101',
      type = 'GENERAL',
      title,
      description,
      message,
      qaNotes,
      screenshotUrl,
      userEmail,
      pageTested,
      pageUrl,
      browser,
      os,
      deviceType,
      screenResolution,
      referrer,
      timestamp,
    } = body;

    const notes = qaNotes || description || message || title || 'Structured QA Report';
    const testPage = pageTested || (pageUrl ? new URL(pageUrl, 'https://localhost').pathname : '/home');

    const newComment = await prisma.qAComment.create({
      data: {
        postId,
        type: type.toUpperCase(),
        qaNotes: notes,
        screenshotUrl: screenshotUrl || null,
        pageTested: testPage,
        browser: browser || null,
        os: os || null,
        deviceType: deviceType || null,
        screenResolution: screenResolution || null,
        referrer: referrer || null,
        timestamp: timestamp || null,
        status: 'NEW',
        upvotes: 0,
      },
    });

    return NextResponse.json(
      { success: true, comment: newComment },
      {
        status: 201,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error' },
      { status: 500 }
    );
  }
}

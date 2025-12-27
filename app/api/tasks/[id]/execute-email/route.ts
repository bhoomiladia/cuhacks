import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { google } from 'googleapis';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded: any = verifyToken(token);
    if (!decoded || !decoded.userId) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { id } = await params;
    const task = await Task.findOne({ _id: id, userId: decoded.userId });

    if (!task) {
        return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    // Get request body
    const { emailIntent, title, description, emailDraft } = await req.json();

    // Determine subject and body: Prefer emailDraft if available, otherwise fallback
    let subject = title;
    let body = description;
    let recipient = '';

    if (emailDraft) {
        if (emailDraft.subject) subject = emailDraft.subject;
        if (emailDraft.body) body = emailDraft.body;
        if (emailDraft.recipient) recipient = emailDraft.recipient;
    } else {
        // Fallback cleanup if no draft provided
        subject = title.replace(/^(Send|Draft|Write).*?(email|mail).*?(to|about)/i, '').trim();
    }

    // Fetch user to get Gmail tokens
    const user = await User.findById(decoded.userId).select('gmailAccessToken gmailRefreshToken');

    if (!user || !user.gmailAccessToken) {
        return NextResponse.json({ message: 'Gmail not connected. Please connect your Gmail account in settings.' }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    oauth2Client.setCredentials({
      access_token: user.gmailAccessToken,
      refresh_token: user.gmailRefreshToken
    });

    // Handle token refresh automatically if needed by googleapis client
    oauth2Client.on('tokens', async (tokens) => {
        if (tokens.access_token) {
             await User.findByIdAndUpdate(decoded.userId, {
                 gmailAccessToken: tokens.access_token,
                 ...(tokens.refresh_token && { gmailRefreshToken: tokens.refresh_token })
             });
        }
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    let result = '';

    if (emailIntent === 'READ') {
        const list = await gmail.users.messages.list({ userId: 'me', maxResults: 5, q: 'is:unread' });
        const messages = list.data.messages || [];
        
        if (messages.length === 0) {
            result = "No unread emails found.";
        } else {
            const summaries = [];
            for (const msg of messages) {
                const details = await gmail.users.messages.get({ userId: 'me', id: msg.id! });
                const headers = details.data.payload?.headers;
                const subject = headers?.find(h => h.name === 'Subject')?.value || '(No Subject)';
                const from = headers?.find(h => h.name === 'From')?.value || 'Unknown';
                const snippet = details.data.snippet || '';
                summaries.push(`From: ${from}\nSubject: ${subject}\nSnippet: ${snippet}`);
            }
            result = `Found ${summaries.length} unread emails:\n\n${summaries.join('\n---\n')}`;
        }
        
    } else if (emailIntent === 'DRAFT') {
        const rawMessage = [
            `To: ${recipient}`,
            'Content-Type: text/plain; charset="UTF-8"',
            'MIME-Version: 1.0',
            'Content-Transfer-Encoding: 7bit',
            `Subject: ${subject}`,
            '',
            `${body}`
        ].join('\n');

        const encodedMessage = Buffer.from(rawMessage).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        const draft = await gmail.users.drafts.create({
            userId: 'me',
            requestBody: {
                message: {
                    raw: encodedMessage
                }
            }
        });

        // Update task log
        await Task.findByIdAndUpdate(id, {
            $push: {
                intermediateSteps: `Draft created in Gmail with ID: ${draft.data.id}`
            },
            finalResult: `Draft created successfully. Subject: ${subject}`
        });

        return NextResponse.json({ success: true, draftId: draft.data.id });

    } else if (emailIntent === 'SEND') {
        const rawMessage = [
            `To: ${recipient}`,
            'Content-Type: text/plain; charset="UTF-8"',
            'MIME-Version: 1.0',
            'Content-Transfer-Encoding: 7bit',
            `Subject: ${subject}`,
            '',
            `${body}`
        ].join('\n');

        const encodedMessage = Buffer.from(rawMessage).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        const sent = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage
            }
        });

        // Update task log
        await Task.findByIdAndUpdate(id, {
            $push: {
                intermediateSteps: `Email sent via Gmail API. ID: ${sent.data.id}`
            },
            finalResult: `Email sent successfully to ${recipient}. Subject: ${subject}`,
            emailSent: true,
            sentAt: new Date()
        });

        return NextResponse.json({ success: true, messageId: sent.data.id });
    } else {
        return NextResponse.json({ message: 'Invalid email intent' }, { status: 400 });
    }

    // Save result to task
    await Task.findByIdAndUpdate(id, {
        $push: {
            executionLogs: {
                agent: 'EmailAgent',
                step: `Executed ${emailIntent}`,
                status: 'completed',
                output: result,
                timestamp: new Date()
            }
        },
        finalResult: result
    });

    return NextResponse.json({ message: 'Success', result });

  } catch (error: any) {
      console.error('Email execution error:', error);
      return NextResponse.json({ message: error.message || 'Error executing email action' }, { status: 500 });
  }
}

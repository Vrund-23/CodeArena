
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import { getSession } from '@/lib/auth';

export async function POST(req) {
    try {
        const session = await getSession();
        if (!session || (session.user.role !== 'admin' && session.user.role !== 'volunteer')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await req.json();
        const { title, description, startTime, endTime, questionCount, yearLevel } = body;

        // Basic validation
        if (!title || !startTime || !endTime || !questionCount || !yearLevel) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const contest = await Contest.create({
            title,
            description,
            startTime,
            endTime,
            questionCount,
            yearLevel,
            createdBy: session.user.id
        });

        return NextResponse.json({ success: true, data: contest }, { status: 201 });
    } catch (error) {
        console.error('Error creating contest:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

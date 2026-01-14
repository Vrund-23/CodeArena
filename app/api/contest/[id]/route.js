
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import Problem from '@/models/Problem'; // Ensure model is registered

export async function GET(req, { params }) {
    try {
        await dbConnect();

        // Next.js 15+: params is a promise
        const resolvedParams = await params;
        const { id } = resolvedParams;

        const contest = await Contest.findById(id).populate({
            path: 'problems',
            select: '-testCases -createdBy', // EXCLUDE testCases for security
        });

        if (!contest) {
            return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: contest });
    } catch (error) {
        console.error('Error fetching contest:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

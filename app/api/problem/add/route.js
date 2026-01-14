
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Problem from '@/models/Problem';
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
        const { contestId, title, description, difficulty, constraints, inputFormat, outputFormat, testCases, tags } = body;

        if (!contestId || !title || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Generate slug manually
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        // 1. Create the Problem
        const problem = await Problem.create({
            title,
            slug,
            description,
            difficulty,
            constraints,
            inputFormat,
            outputFormat,
            testCases, // Expecting array of {input, output}
            tags,
            createdBy: session.user.id
        });

        // 2. Link to Contest
        const contest = await Contest.findByIdAndUpdate(
            contestId,
            { $push: { problems: problem._id } },
            { new: true }
        );

        if (!contest) {
            // Rollback if contest not found (optional but good practice)
            await Problem.findByIdAndDelete(problem._id);
            return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: problem }, { status: 201 });
    } catch (error) {
        console.error('Error adding problem:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

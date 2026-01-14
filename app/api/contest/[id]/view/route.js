
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import Submission from '@/models/Submission';
import Problem from '@/models/Problem'; // Ensure registered
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        // 1. Fetch Contest with basic fields first to check timing
        let contest = await Contest.findById(id);

        if (!contest) {
            return NextResponse.json({ error: 'Contest not found' }, { status: 404 });
        }

        const now = new Date();
        const startTime = new Date(contest.startTime);
        const isStudent = session.user.role === 'student';
        const isUpcoming = now < startTime;

        // 2. Security Check
        // If student AND contest hasn't started, hide problems
        if (isStudent && isUpcoming) {
            // Return stripped data
            return NextResponse.json({
                success: true,
                data: {
                    _id: contest._id,
                    title: contest.title,
                    description: contest.description,
                    startTime: contest.startTime,
                    endTime: contest.endTime,
                    questionCount: contest.questionCount,
                    status: 'upcoming',
                    problems: [] // Explicitly empty
                }
            });
        }

        // 3. If Live/Past or Admin, populate problems fully (excluding secrets)
        contest = await Contest.findById(id).populate({
            path: 'problems',
            select: '-testCases -expectedOutput -createdBy', // Exclude sensitive info
            model: Problem
        }).lean();

        // 4. Solve Status Integration
        const problemSlugs = contest.problems.map(p => p.slug);
        const submissions = await Submission.find({
            userId: session.user.id,
            problemSlug: { $in: problemSlugs }
        }).select('problemSlug status').lean();

        // Create a map of slug -> status
        // Prioritize 'Accepted' > 'Attempted' (any other status)
        const statusMap = {};

        submissions.forEach(sub => {
            const current = statusMap[sub.problemSlug];
            if (current === 'solved') return; // Already solved, don't downgrade

            if (sub.status === 'Accepted') {
                statusMap[sub.problemSlug] = 'solved';
            } else {
                statusMap[sub.problemSlug] = 'attempted';
            }
        });

        // 5. Attach status to problems
        const problemsWithStatus = contest.problems.map(prob => ({
            ...prob,
            userStatus: statusMap[prob.slug] || 'unsolved'
        }));

        return NextResponse.json({
            success: true,
            data: {
                ...contest,
                problems: problemsWithStatus,
                status: now > new Date(contest.endTime) ? 'past' : (isUpcoming ? 'upcoming' : 'live')
            }
        });

    } catch (error) {
        console.error('Error fetching contest details:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

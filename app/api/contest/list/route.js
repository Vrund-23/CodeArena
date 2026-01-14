
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic'; // Ensure not statically cached as time is critical

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const now = new Date();

        // Fetch all contests (projection can be optimized if needed)
        // We can do filtering in memory for smaller datasets or DB queries for larger. 
        // Given likely modest number of contests, in-memory split is fine and simplifies categorization logic.
        // However, for scalability, separate queries are better. Let's do separate queries for strict sorting.

        const [live, upcoming, past] = await Promise.all([
            // Live: Started but not ended
            Contest.find({
                startTime: { $lte: now },
                endTime: { $gt: now }
            }).sort({ endTime: 1 }).lean(),

            // Upcoming: Not started yet
            Contest.find({
                startTime: { $gt: now }
            }).sort({ startTime: 1 }).lean(),

            // Past: Ended
            Contest.find({
                endTime: { $lte: now }
            }).sort({ endTime: -1 }).lean()
        ]);

        return NextResponse.json({
            success: true,
            data: {
                live,
                upcoming,
                past
            }
        });

    } catch (error) {
        console.error('Error fetching contests:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

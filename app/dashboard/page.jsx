import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LogoutButton from '@/app/components/LogoutButton';
import dbConnect from '@/lib/db';
import Submission from '@/models/Submission';
import StatsSection from '@/app/components/StatsSection';
import DashboardClient from './DashboardClient';
import { Zap } from 'lucide-react';

export default async function DashboardPage() {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    const { user: sessionUser } = session;
    const userId = sessionUser.id || sessionUser._id;

    await dbConnect();

    // 1. Stats
    let solvedCount = 0;
    try {
        const solvedProblems = await Submission.distinct('problemSlug', { userId, status: 'Accepted' });
        solvedCount = solvedProblems.length;
    } catch (error) {
        console.error("Error fetching stats:", error);
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-primary/20 selection:text-primary">
            {/* Background glow effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            <nav className="relative z-10 glass-nav">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-white tracking-tight">Talent IQ</h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 bg-white/5 py-1.5 px-3 rounded-full border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                                {sessionUser.name.charAt(0)}
                            </div>
                            <div className="hidden sm:block text-sm">
                                <span className="font-medium text-white block leading-none">{sessionUser.name}</span>
                                <span className="text-[10px] text-base-content/50 uppercase tracking-wider font-semibold">
                                    {sessionUser.role}
                                </span>
                            </div>
                        </div>
                        <LogoutButton />
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-6 py-10 w-full">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Back, {sessionUser.name.split(' ')[0]}</h2>
                    <p className="text-base-content/60">Here is your progress overview.</p>
                </div>

                <StatsSection solvedCount={solvedCount} />

                {/* Unified Dashboard Client for Contests & Volunteer Actions */}
                <DashboardClient initialRole={sessionUser.role} />
            </main>
        </div>
    );
}

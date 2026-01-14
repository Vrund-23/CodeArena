
'use client';
import { useState, useEffect, use } from 'react';
import { Clock, CheckCircle2, Circle, AlertCircle, ArrowRight, Trophy, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function ContestDetailPage({ params: paramsPromise }) {
    const params = use(paramsPromise); // Next.js 15+ param unwrapping
    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState('');
    const [status, setStatus] = useState('loading'); // loading, upcoming, live, past

    useEffect(() => {
        fetchContestDetails();
    }, [params.id]);

    useEffect(() => {
        if (!contest) return;

        const timer = setInterval(() => {
            calculateTimeLeft();
        }, 1000);

        calculateTimeLeft(); // Initial call

        return () => clearInterval(timer);
    }, [contest]);

    const calculateTimeLeft = () => {
        if (!contest) return;

        const now = new Date().getTime();
        const start = new Date(contest.startTime).getTime();
        const end = new Date(contest.endTime).getTime();

        let target = start;
        let newStatus = 'upcoming';

        if (now >= start && now < end) {
            target = end;
            newStatus = 'live';
        } else if (now >= end) {
            newStatus = 'past';
            setStatus('past');
            setTimeLeft('Contest Ended');
            return;
        }

        setStatus(newStatus);

        const distance = target - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft(`${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m ${seconds}s`);
    };

    const fetchContestDetails = async () => {
        try {
            const res = await fetch(`/api/contest/${params.id}/view`);
            const data = await res.json();
            if (data.success) {
                setContest(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch contest", error);
        } finally {
            setLoading(false);
        }
    };

    const getDifficultyColor = (diff) => {
        switch (diff?.toLowerCase()) {
            case 'easy': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'hard': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            default: return 'text-slate-400 bg-slate-400/10';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (!contest) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Contest Not Found</h1>
                    <Link href="/dashboard" className="text-indigo-400 hover:text-indigo-300">Return to Dashboard</Link>
                </div>
            </div>
        );
    }

    // State 1: Upcoming (Secure Lobby)
    if (status === 'upcoming') {
        return (
            <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative z-10 text-center max-w-2xl mx-auto space-y-8">
                    <div className="space-y-4">
                        <span className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-sm font-bold tracking-wider mb-4">
                            UPCOMING CONTEST
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500 tracking-tight">
                            {contest.title}
                        </h1>
                        <p className="text-xl text-slate-400">{contest.description}</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                        <p className="text-sm text-slate-400 uppercase tracking-widest mb-2 font-bold">Starts In</p>
                        <div className="text-4xl md:text-6xl font-mono font-bold text-white tabular-nums tracking-tight">
                            {timeLeft}
                        </div>
                        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-500">
                            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(contest.startTime).toLocaleDateString()}</span>
                            <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {new Date(contest.startTime).toLocaleTimeString()}</span>
                        </div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3 text-left">
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-amber-500 font-bold text-sm">Contest Locked</h3>
                            <p className="text-amber-200/60 text-sm mt-1">
                                The problem list will automatically appear here when the countdown reaches zero.
                                Good luck!
                            </p>
                        </div>
                    </div>

                    <Link href="/dashboard" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mt-8">
                        <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // State 2: Live / Past
    return (
        <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
            {/* Header */}
            <div className="border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-white">{contest.title}</h1>
                        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1">
                            {status === 'live' ? (
                                <span className="flex items-center gap-1.5 text-emerald-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    LIVE - Ends in {timeLeft}
                                </span>
                            ) : (
                                <span className="text-slate-500">Ended</span>
                            )}
                        </div>
                    </div>
                    <Link href="/dashboard">
                        <button className="text-sm text-slate-400 hover:text-white transition-colors">
                            Exit Contest
                        </button>
                    </Link>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Problem List */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-2xl font-bold">Problems</h2>
                            <span className="text-slate-400 text-sm">{contest.problems.length} Challenges</span>
                        </div>

                        <div className="space-y-3">
                            {contest.problems.map((problem, index) => (
                                <div
                                    key={problem._id}
                                    className="group flex flex-col md:flex-row md:items-center justify-between bg-white/5 border border-white/10 p-5 rounded-xl hover:bg-white/10 hover:border-indigo-500/30 transition-all"
                                >
                                    <div className="flex items-start gap-4 mb-4 md:mb-0">
                                        {/* Status Icon */}
                                        <div className="mt-1">
                                            {problem.userStatus === 'solved' && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                                            {problem.userStatus === 'attempted' && <div className="w-5 h-5 rounded-full border-2 border-amber-500 bg-amber-500/20" />}
                                            {problem.userStatus === 'unsolved' && <Circle className="w-5 h-5 text-slate-600" />}
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                                                {index + 1}. {problem.title}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-2 text-sm">
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getDifficultyColor(problem.difficulty)}`}>
                                                    {problem.difficulty}
                                                </span>
                                                <span className="text-slate-500 font-mono">
                                                    Score: 100
                                                </span>
                                                <span className="text-slate-500 capitalize text-xs bg-white/5 px-2 py-0.5 rounded-full">
                                                    {/* Tags could go here if populated */}
                                                    Algorithm
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <Link href={`/problem/${problem.slug}`}>
                                        <button className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 group-hover:translate-x-1">
                                            Solve Challenge <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </Link>
                                </div>
                            ))}
                            {contest.problems.length === 0 && (
                                <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10 border-dashed text-slate-500">
                                    No problems added to this contest yet.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar / Leaderboard Preview / Stats */}
                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-yellow-500" /> Your Performance
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm text-slate-400 mb-1">
                                        <span>Progress</span>
                                        <span>
                                            {contest.problems.filter(p => p.userStatus === 'solved').length} / {contest.problems.length}
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 transition-all duration-1000"
                                            style={{ width: `${(contest.problems.filter(p => p.userStatus === 'solved').length / (contest.problems.length || 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5 text-center">
                                        <div className="text-2xl font-bold text-white">
                                            {contest.problems.filter(p => p.userStatus === 'solved').length * 100}
                                        </div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Points</div>
                                    </div>
                                    <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5 text-center">
                                        <div className="text-2xl font-bold text-white">N/A</div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Rank</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-white/5 rounded-xl p-6">
                            <h4 className="font-bold text-indigo-300 text-sm mb-2">Instructions</h4>
                            <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
                                <li>Read problem statements carefully.</li>
                                <li>Input/Output formats must be exact.</li>
                                <li>Submit as many times as you like.</li>
                                <li>Plagiarism will lead to disqualification.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

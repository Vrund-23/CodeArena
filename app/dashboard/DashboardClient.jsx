'use client';
import { useState, useEffect } from 'react';
import { Clock, Calendar, Trophy, ArrowRight, AlertCircle, Plus, FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import CreateContestForm from '@/app/components/CreateContestForm';
import AddProblemForm from '@/app/components/AddProblemForm';

export default function DashboardClient({ initialRole }) {
    const [contests, setContests] = useState({ live: [], upcoming: [], past: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // State for Adding Problems
    const [selectedContestForProblem, setSelectedContestForProblem] = useState(null);

    useEffect(() => {
        fetchContests();
    }, []);

    const fetchContests = async () => {
        try {
            const res = await fetch('/api/contest/list');
            const data = await res.json();

            if (data.success) {
                setContests(data.data);

                if (data.data.live.length > 0) {
                    setActiveTab('live');
                } else {
                    setActiveTab('upcoming');
                }
            }
        } catch (error) {
            console.error('Failed to fetch contests', error);
        } finally {
            setLoading(false);
        }
    };

    const handleContestCreated = (newContest) => {
        setShowCreateModal(false);
        fetchContests(); // Refresh list
    };

    const handleProblemAdded = () => {
        setSelectedContestForProblem(null);
        // We might want to show a toast here
        alert("Problem added successfully!");
    };

    const formatDuration = (start, end) => {
        const diff = new Date(end) - new Date(start);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    // Card Component inside
    const ContestCard = ({ contest, status }) => {
        const isLive = status === 'live';
        const isUpcoming = status === 'upcoming';
        const isPast = status === 'past';
        const canManage = initialRole === 'volunteer' || initialRole === 'admin';

        return (
            <div className={`relative group bg-white/5 border border-white/10 rounded-2xl p-6 transition-all hover:border-white/20 hover:-translate-y-1 hover:shadow-xl ${isLive ? 'shadow-emerald-500/10 border-emerald-500/20' : ''
                }`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{contest.title}</h3>
                        <p className="text-sm text-slate-400 line-clamp-1">{contest.description || 'No description provided.'}</p>
                    </div>
                    {isLive && (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            LIVE
                        </span>
                    )}
                    {isUpcoming && (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold">
                            <Clock className="w-3 h-3" />
                            UPCOMING
                        </span>
                    )}
                    {isPast && (
                        <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 rounded-full text-xs font-bold">
                            FINISHED
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span>{new Date(contest.startTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span>{new Date(contest.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span>Duration: {formatDuration(contest.startTime, contest.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-slate-500" />
                        <span>{contest.questionCount} Problems</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    {/* Primary Button */}
                    {isLive && (
                        <Link href={`/contest/${contest._id}`} className="flex-1">
                            <button className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                                Enter Contest <ArrowRight className="w-4 h-4" />
                            </button>
                        </Link>
                    )}
                    {isUpcoming && !canManage && (
                        <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl transition-all border border-white/10 hover:border-white/20 flex items-center justify-center gap-2">
                            Register Now
                        </button>
                    )}
                    {isPast && (
                        <button className="w-full py-3 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2">
                            View Solutions
                        </button>
                    )}

                    {/* Volunteer/Admin Actions */}
                    {canManage && (isUpcoming || isLive) && (
                        <button
                            onClick={() => setSelectedContestForProblem(contest)}
                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                        >
                            <FileQuestion className="w-4 h-4" />
                            Add Problem
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
                {/* Tabs container */}
                <div className="flex gap-4 border-b border-white/10 flex-1">
                    {['live', 'upcoming', 'past'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"></span>
                            )}
                            <span className="ml-2 text-xs opacity-60 bg-white/10 px-1.5 py-0.5 rounded-full">
                                {contests[tab]?.length || 0}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Volunteer Action Button (Only show if not admin, as admins have full panel usually, but user requested 'any volunteer') */}
                {(initialRole === 'volunteer' || initialRole === 'admin') && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 rounded-lg text-white font-medium text-sm hover:shadow-lg hover:shadow-indigo-500/20 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Add Contest
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {contests[activeTab]?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {contests[activeTab].map(contest => (
                                <ContestCard key={contest._id} contest={contest} status={activeTab} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-slate-500" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">No {activeTab} contests found</h3>
                            <p className="text-slate-500 max-w-sm mx-auto">
                                Check back later.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal: Create Contest */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-slate-900 rounded-2xl border border-white/10 shadow-2xl">
                        <div className="p-2 flex justify-end">
                            <button onClick={() => setShowCreateModal(false)} className="p-2 text-slate-500 hover:text-white transition-colors">✕</button>
                        </div>
                        <div className="px-6 pb-6">
                            <CreateContestForm onSuccess={handleContestCreated} />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Add Problem */}
            {selectedContestForProblem && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 rounded-2xl border border-white/10 shadow-2xl">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-white">Add Problem to: {selectedContestForProblem.title}</h3>
                            <button onClick={() => setSelectedContestForProblem(null)} className="p-2 text-slate-500 hover:text-white transition-colors">✕</button>
                        </div>
                        <div className="px-6 pb-6">
                            <AddProblemForm contestId={selectedContestForProblem._id} onSuccess={handleProblemAdded} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

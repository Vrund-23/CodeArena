'use client';
import { useState, useEffect } from 'react';
import { Plus, Clock, FileQuestion, Calendar as CalendarIcon, ArrowLeft, MoreVertical, Loader2 } from 'lucide-react';
import CreateContestForm from '@/app/components/CreateContestForm';
import AddProblemForm from '@/app/components/AddProblemForm';

export default function ContestsPage() {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedContest, setSelectedContest] = useState(null);

    useEffect(() => {
        fetchContests();
    }, []);

    const fetchContests = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/contests');
            const data = await res.json();
            if (data.success) {
                setContests(data.data);
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
        // Optionally refresh contest details if we were showing them
        // For now, just maybe show a success toast or similar (handled in component)
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'ongoing': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'completed': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
            default: return 'bg-slate-500/10 text-slate-400';
        }
    };

    // View: Contest Details & Problem Management
    if (selectedContest) {
        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <button
                    onClick={() => setSelectedContest(null)}
                    className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Contests
                </button>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{selectedContest.title}</h1>
                            <p className="text-slate-400 mb-4">{selectedContest.description}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4" />
                                    {new Date(selectedContest.startTime).toLocaleString()}
                                </span>
                                <span className="flex items-center gap-2">
                                    <FileQuestion className="w-4 h-4" />
                                    {selectedContest.questionCount} Questions Targeted
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs">
                                    {selectedContest.yearLevel.join(', ')}
                                </span>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(selectedContest.status)}`}>
                            {selectedContest.status}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Add Problem */}
                    <div className="lg:col-span-2">
                        <AddProblemForm contestId={selectedContest._id} onSuccess={handleProblemAdded} />
                    </div>

                    {/* Right Column: Existing Problems (Placeholder for now) */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 h-fit">
                        <h3 className="text-lg font-bold text-white mb-4">Contest Problems</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            You have added {selectedContest.problems?.length || 0} problems so far.
                        </p>
                        <div className="space-y-3">
                            {/* In a real app, we would fetch and list the actual problems here using the ID */}
                            {selectedContest.problems?.length > 0 ? (
                                selectedContest.problems.map((probId, idx) => (
                                    <div key={idx} className="p-3 bg-slate-800/50 rounded border border-white/5 flex items-center justify-between">
                                        <span className="text-sm text-slate-300">Problem {idx + 1}</span>
                                        <span className="text-xs text-slate-500 font-mono">{probId.toString().substring(0, 8)}...</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 border border-dashed border-white/10 rounded-lg">
                                    <p className="text-slate-500 text-sm">No problems added yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // View: List of Contests
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Contest Management</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-full flex items-center gap-2 hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-medium"
                >
                    <Plus className="w-4 h-4" /> Create Contest
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contests.map((contest) => (
                        <div
                            key={contest._id}
                            onClick={() => setSelectedContest(contest)}
                            className="relative group bg-white/5 border border-white/10 p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                        >
                            {/* Hover Gradient Background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-lg text-white line-clamp-1 group-hover:text-indigo-300 transition-colors">{contest.title}</h3>
                                    <span className={`px-2.5 py-1 text-xs rounded-full uppercase font-bold border shadow-sm ${getStatusColor(contest.status)}`}>
                                        {contest.status}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm mb-6 line-clamp-2 min-h-[40px] group-hover:text-gray-300 transition-colors">{contest.description || 'No description provided.'}</p>

                                <div className="space-y-3 text-sm text-gray-500 border-t border-white/5 pt-4 group-hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-3 group-hover:text-gray-400 transition-colors">
                                        <CalendarIcon className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                                        <span>{new Date(contest.startTime).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-3 group-hover:text-gray-400 transition-colors">
                                        <Clock className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                                        <span>{new Date(contest.startTime).toLocaleTimeString()} - {new Date(contest.endTime).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between group-hover:text-gray-400 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <FileQuestion className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                                            <span>{contest.questionCount} Questions</span>
                                        </div>
                                        <div className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400">
                                            {contest.problems?.length || 0} Added
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {contests.length === 0 && (
                        <div className="col-span-full text-center py-16 text-gray-500 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                            No contests scheduled yet. Click "Create Contest" to get started.
                        </div>
                    )}
                </div>
            )}

            {/* Modal for Creating Contest */}
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
        </div>
    );
}

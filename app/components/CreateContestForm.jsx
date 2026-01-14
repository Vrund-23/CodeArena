
'use client';
import { useState } from 'react';
import { Loader2, Calendar, Layout, Users } from 'lucide-react';

export default function CreateContestForm({ onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        questionCount: 5,
        yearLevel: ['All']
    });

    const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'All'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleYearToggle = (year) => {
        setFormData(prev => {
            const current = [...prev.yearLevel];
            if (year === 'All') {
                return { ...prev, yearLevel: ['All'] };
            }

            // If selecting a specific year, remove 'All'
            let newYears = current.filter(y => y !== 'All');

            if (newYears.includes(year)) {
                newYears = newYears.filter(y => y !== year);
            } else {
                newYears.push(year);
            }

            // If nothing selected or manually clearing everything, maybe default to All or requried logic?
            // User requirement said simple select. Let's keep it robust.
            if (newYears.length === 0) return { ...prev, yearLevel: ['All'] };

            return { ...prev, yearLevel: newYears };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/contest/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                if (onSuccess) onSuccess(data.data);
                alert('Contest created successfully!');
                // Reset form
                setFormData({
                    title: '',
                    description: '',
                    startTime: '',
                    endTime: '',
                    questionCount: 5,
                    yearLevel: ['All']
                });
            } else {
                alert(data.error || 'Failed to create contest');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-900 border border-white/10 p-6 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">Create New Contest</h2>

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Contest Title</label>
                <div className="relative">
                    <Layout className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                        placeholder="Weekly Contest #5"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none h-24"
                    placeholder="Brief details about the contest..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Start Time</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                        <input
                            type="datetime-local"
                            name="startTime"
                            value={formData.startTime}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">End Time</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                        <input
                            type="datetime-local"
                            name="endTime"
                            value={formData.endTime}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            required
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Target Audience</label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {yearOptions.map(year => (
                        <button
                            type="button"
                            key={year}
                            onClick={() => handleYearToggle(year)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${formData.yearLevel.includes(year)
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            {year}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Total Questions</label>
                <input
                    type="number"
                    name="questionCount"
                    value={formData.questionCount}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/20 text-white font-bold rounded-lg transition-all flex items-center justify-center disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Create Contest'}
            </button>
        </form>
    );
}

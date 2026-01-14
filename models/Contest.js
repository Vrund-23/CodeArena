import mongoose from 'mongoose';

const ContestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a contest title'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    startTime: {
        type: Date,
        required: [true, 'Please provide a start time'],
    },
    endTime: {
        type: Date,
        required: [true, 'Please provide an end time'],
    },
    questionCount: {
        type: Number,
        required: [true, 'Please provide the number of questions'],
        min: 1,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['scheduled', 'ongoing', 'completed'],
        default: 'scheduled',
    },
    yearLevel: {
        type: [String],
        enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'All'],
        default: ['All'],
        required: true,
    },
    problems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
    }],
}, { timestamps: true });

export default mongoose.models.Contest || mongoose.model('Contest', ContestSchema);

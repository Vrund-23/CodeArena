import mongoose from 'mongoose';

const ProblemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true,
    },
    slug: {
        type: String,
        unique: true,
        // Will be generated from title if not provided, usually on pre-save
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Medium',
    },
    constraints: {
        type: String,
        default: '',
    },
    inputFormat: {
        type: String,
        default: '',
    },
    outputFormat: {
        type: String,
        default: '',
    },
    testCases: [{
        input: { type: String, required: true },
        output: { type: String, required: true },
        isPublic: { type: Boolean, default: false }, // If true, shown to user as example
    }],
    tags: [{
        type: String,
        trim: true,
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });


export default mongoose.models.Problem || mongoose.model('Problem', ProblemSchema);

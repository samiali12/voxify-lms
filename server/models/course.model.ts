import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";


interface IComment extends Document {
    user: IUser,
    question: string,
    questionReplies: IComment[];
}

interface IReview extends Document {
    user: IUser,
    rating: number,
    comment: string,
    commentReplies?: IComment[];
}

interface ILink extends Document {
    title: string,
    url: string,
}

interface ICourseData extends Document {
    title: string,
    description: string,
    videoUrl: string,
    videoThumbnail: object,
    videoSection: string,
    videoLength: number,
    videoPlayer: string,
    links: ILink[],
    suggestion: string,
    questions: IComment[]
}

interface IThumbnail extends Document {
    public_id: string;
    url: string;
}

interface ICourse extends Document {
    name: string,
    description: string,
    price: number,
    estimatedPrice: number,
    thumbnail: IThumbnail,
    tags: string,
    level: string,
    demoUrl: string,
    benefits: { title: string }[],
    prerequistes: { title: string }[],
    reviews: IReview[],
    courseData: ICourseData[],
    rating?: number,
    purchased?: number
}


// Now we start defining the schema 

const commentSchema = new Schema<IComment>({
    user: Object,
    question: String,
    questionReplies: [Object]
})

const reviewSchema = new Schema<IReview>({
    user: Object,
    rating: {
        type: Number,
        default: 0,
    },
    comment: String,
    commentReplies: []
})

const linkSchema = new Schema<ILink>({
    title: String,
    url: String
})

const courseDataSchema = new Schema<ICourseData>({
    title: String,
    description: String,
    videoUrl: String,
    videoThumbnail: Object,
    videoSection: String,
    videoLength: Number,
    videoPlayer: String,
    suggestion: String,
    links: [linkSchema],
    questions: [commentSchema],
})

const thumbnailSchema = new Schema<IThumbnail>({
    public_id: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
});

const courseSchema = new Schema<ICourse>({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,

    },
    price: {
        type: Number,

    },
    estimatedPrice: {
        type: Number,

    },
    thumbnail: {
        type: thumbnailSchema,
    },
    tags: {
        type: String,

    },
    level: {
        type: String,

    },
    demoUrl: {
        type: String,

    },
    benefits: [{ title: String }],
    prerequistes: [{ title: String }],
    reviews: [reviewSchema],
    courseData: [courseDataSchema],
    rating: {
        type: Number,
        default: 0
    },
    purchased: {
        type: Number,
        default: 0
    }
});

const courseModel: Model<ICourse> = mongoose.model('Course', courseSchema)

export default courseModel;
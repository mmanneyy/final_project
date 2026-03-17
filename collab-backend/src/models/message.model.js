import mongoose from "mongoose";
const { Schema } = mongoose;

const MessageSchema = new Schema(
    {
        roomId: {
            type: Schema.Types.ObjectId,
            ref: "Room",
            required: true,
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 4000,
        },
    },
    {
        timestamps: true,
    },
);
// Enables efficient pagination and sorting of messages within a room
MessageSchema.index({ roomId: 1, createdAt: -1 });

export default mongoose.model("Message", MessageSchema);

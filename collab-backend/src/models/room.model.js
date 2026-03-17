import mongoose from "mongoose";
const { Schema } = mongoose;
/**
 * Represents the membership of a user within a room.
 * This is a value object and does not exist independently
 */
const RoomMemberSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
        //Timestamp when the user left the room.
        leftAt: {
            type: Date,
        },
    },
    {
        /**
         * RoomMember is a value object, not a standalone entity.
         */
        _id: false,
    },
);

const RoomSchema = new Schema(
    {

        type: {
            type: String,
            enum: ["dm", "group"],
            required: true,
        },
        members: {
            type: [RoomMemberSchema],
            required: true,
            validate: {
                validator: function(arr) {
                    // For DM rooms, must have exactly 2 members
                    if (this.type === 'dm') {
                        return Array.isArray(arr) && arr.length === 2;
                    }
                    // For group rooms, must have at least 1 member (the creator)
                    return Array.isArray(arr) && arr.length >= 1;
                },
                message: function(props) {
                    if (props.value.type === 'dm') {
                        return "DM rooms must have exactly 2 members";
                    }
                    return "Group rooms must have at least 1 member";
                },
            },
        },
        // Guarantees that only one DM room exists between the same pair of users.
        dmKey: {
            type: String,
            trim: true,
        },
        //Used for fast sorting of chat lists.
        lastMessageAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    },
);

//Enables fast lookup of all rooms a user belongs to
RoomSchema.index({ "members.userId": 1 });
// Prevents duplicate DM rooms between the same pair of users
RoomSchema.index(
    { dmKey: 1 },
    {
        unique: true,
        partialFilterExpression: { type: "dm" },
    },
);
//Enables fast sorting of rooms by recent activity
RoomSchema.index({ lastMessageAt: -1 });

export default mongoose.model("Room", RoomSchema);

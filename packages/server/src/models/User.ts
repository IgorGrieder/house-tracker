import mongoose, { type Document, Schema } from "mongoose";
import type { Role } from "shared";

export interface UserDocument extends Document {
	name: string;
	email: string;
	passwordHash: string;
	role: Role;
	householdId: mongoose.Types.ObjectId;
	avatarColor: string;
	refreshTokens: string[];
	createdAt: Date;
}

const userSchema = new Schema<UserDocument>({
	name: { type: String, required: true, trim: true },
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true,
	},
	passwordHash: { type: String, required: true },
	role: { type: String, enum: ["admin", "member"], default: "member" },
	householdId: { type: Schema.Types.ObjectId, ref: "Household" },
	avatarColor: { type: String, default: "#6366f1" },
	refreshTokens: [{ type: String }],
	createdAt: { type: Date, default: Date.now },
});

userSchema.methods.toJSON = function () {
	const obj = this.toObject();
	delete obj.passwordHash;
	delete obj.refreshTokens;
	delete obj.__v;
	return obj;
};

export const User = mongoose.model<UserDocument>("User", userSchema);

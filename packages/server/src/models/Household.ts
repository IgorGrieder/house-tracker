import mongoose, { type Document, Schema } from "mongoose";

export interface HouseholdDocument extends Document {
	name: string;
	createdBy: mongoose.Types.ObjectId;
	members: mongoose.Types.ObjectId[];
	createdAt: Date;
}

const householdSchema = new Schema<HouseholdDocument>({
	name: { type: String, required: true, trim: true },
	createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
	members: [{ type: Schema.Types.ObjectId, ref: "User" }],
	createdAt: { type: Date, default: Date.now },
});

export const Household = mongoose.model<HouseholdDocument>(
	"Household",
	householdSchema,
);

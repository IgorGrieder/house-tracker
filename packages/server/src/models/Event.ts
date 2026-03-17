import mongoose, { type Document, Schema } from "mongoose";
import type { RecurrenceType } from "shared";

export interface EventDocument extends Document {
	title: string;
	description?: string;
	startDate: Date;
	endDate: Date;
	allDay: boolean;
	recurrence: RecurrenceType;
	assignedTo: mongoose.Types.ObjectId[];
	createdBy: mongoose.Types.ObjectId;
	householdId: mongoose.Types.ObjectId;
}

const eventSchema = new Schema<EventDocument>({
	title: { type: String, required: true, trim: true },
	description: { type: String, trim: true },
	startDate: { type: Date, required: true },
	endDate: { type: Date, required: true },
	allDay: { type: Boolean, default: false },
	recurrence: {
		type: String,
		enum: ["none", "daily", "weekly", "monthly"],
		default: "none",
	},
	assignedTo: [{ type: Schema.Types.ObjectId, ref: "User" }],
	createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
	householdId: {
		type: Schema.Types.ObjectId,
		ref: "Household",
		required: true,
	},
});

eventSchema.index({ householdId: 1, startDate: 1 });

export const Event = mongoose.model<EventDocument>("Event", eventSchema);

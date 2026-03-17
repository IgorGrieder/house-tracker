import mongoose, { type Document, Schema } from "mongoose";
import type { RecurrenceType, TaskStatus } from "shared";

export interface TaskDocument extends Document {
	title: string;
	description?: string;
	assignedTo: mongoose.Types.ObjectId[];
	dueDate: Date;
	recurrence: RecurrenceType;
	status: TaskStatus;
	completedBy?: mongoose.Types.ObjectId;
	completedAt?: Date;
	householdId: mongoose.Types.ObjectId;
	createdBy: mongoose.Types.ObjectId;
}

const taskSchema = new Schema<TaskDocument>({
	title: { type: String, required: true, trim: true },
	description: { type: String, trim: true },
	assignedTo: [{ type: Schema.Types.ObjectId, ref: "User" }],
	dueDate: { type: Date, required: true },
	recurrence: {
		type: String,
		enum: ["none", "daily", "weekly", "monthly"],
		default: "none",
	},
	status: {
		type: String,
		enum: ["pending", "in-progress", "done"],
		default: "pending",
	},
	completedBy: { type: Schema.Types.ObjectId, ref: "User" },
	completedAt: { type: Date },
	householdId: {
		type: Schema.Types.ObjectId,
		ref: "Household",
		required: true,
	},
	createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

taskSchema.index({ householdId: 1, status: 1 });
taskSchema.index({ householdId: 1, dueDate: 1 });

export const Task = mongoose.model<TaskDocument>("Task", taskSchema);

import mongoose, { type Document, Schema } from "mongoose";
import { EXPENSE_CATEGORIES } from "shared";

export interface ExpenseDocument extends Document {
	amount: number;
	category: string;
	description: string;
	date: Date;
	paidBy: mongoose.Types.ObjectId;
	householdId: mongoose.Types.ObjectId;
	createdBy: mongoose.Types.ObjectId;
}

const expenseSchema = new Schema<ExpenseDocument>({
	amount: { type: Number, required: true, min: 0 },
	category: { type: String, required: true, enum: EXPENSE_CATEGORIES },
	description: { type: String, required: true, trim: true },
	date: { type: Date, required: true, default: Date.now },
	paidBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
	householdId: {
		type: Schema.Types.ObjectId,
		ref: "Household",
		required: true,
	},
	createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

expenseSchema.index({ householdId: 1, date: -1 });
expenseSchema.index({ householdId: 1, category: 1 });

export const Expense = mongoose.model<ExpenseDocument>(
	"Expense",
	expenseSchema,
);

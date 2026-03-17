import mongoose, { type Document, Schema } from "mongoose";

export interface ShoppingListItemDoc {
	name: string;
	quantity: number;
	category: string;
	checked: boolean;
	addedBy: mongoose.Types.ObjectId;
}

export interface ShoppingListDocument extends Document {
	name: string;
	householdId: mongoose.Types.ObjectId;
	createdBy: mongoose.Types.ObjectId;
	archived: boolean;
	items: ShoppingListItemDoc[];
}

const shoppingListItemSchema = new Schema<ShoppingListItemDoc>({
	name: { type: String, required: true, trim: true },
	quantity: { type: Number, default: 1, min: 1 },
	category: { type: String, default: "general", trim: true },
	checked: { type: Boolean, default: false },
	addedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

const shoppingListSchema = new Schema<ShoppingListDocument>({
	name: { type: String, required: true, trim: true },
	householdId: {
		type: Schema.Types.ObjectId,
		ref: "Household",
		required: true,
	},
	createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
	archived: { type: Boolean, default: false },
	items: [shoppingListItemSchema],
});

shoppingListSchema.index({ householdId: 1, archived: 1 });

export const ShoppingList = mongoose.model<ShoppingListDocument>(
	"ShoppingList",
	shoppingListSchema,
);

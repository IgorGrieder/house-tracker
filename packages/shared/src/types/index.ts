export type Role = "admin" | "member";

export type TaskStatus = "pending" | "in-progress" | "done";

export type RecurrenceType = "daily" | "weekly" | "monthly" | "none";

export interface IUser {
	_id: string;
	name: string;
	email: string;
	role: Role;
	householdId: string;
	avatarColor: string;
	createdAt: Date;
}

export interface IHousehold {
	_id: string;
	name: string;
	createdBy: string;
	members: string[];
	createdAt: Date;
}

export interface IEvent {
	_id: string;
	title: string;
	description?: string;
	startDate: Date;
	endDate: Date;
	allDay: boolean;
	recurrence: RecurrenceType;
	assignedTo: string[];
	createdBy: string;
	householdId: string;
}

export interface IShoppingListItem {
	_id: string;
	name: string;
	quantity: number;
	category: string;
	checked: boolean;
	addedBy: string;
}

export interface IShoppingList {
	_id: string;
	name: string;
	householdId: string;
	createdBy: string;
	archived: boolean;
	items: IShoppingListItem[];
}

export interface ITask {
	_id: string;
	title: string;
	description?: string;
	assignedTo: string[];
	dueDate: Date;
	recurrence: RecurrenceType;
	status: TaskStatus;
	completedBy?: string;
	completedAt?: Date;
	householdId: string;
	createdBy: string;
}

export interface IExpense {
	_id: string;
	amount: number;
	category: string;
	description: string;
	date: Date;
	paidBy: string;
	householdId: string;
	createdBy: string;
}

export const EXPENSE_CATEGORIES = [
	"groceries",
	"utilities",
	"rent",
	"entertainment",
	"transportation",
	"healthcare",
	"dining",
	"other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

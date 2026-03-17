import { type FormEvent, useState } from "react";
import { EXPENSE_CATEGORIES, type IExpense } from "shared";
import { Button } from "../components/Button";
import { Card, CardHeader } from "../components/Card";
import { Empty, Spinner } from "../components/Empty";
import { Input, Select } from "../components/Input";
import { Modal } from "../components/Modal";
import { apiDelete, apiPost, useApi } from "../hooks/useApi";

interface ExpenseSummary {
	total: number;
	count: number;
	byCategory: { _id: string; total: number; count: number }[];
	byMember: {
		_id: string;
		total: number;
		count: number;
		user: { name: string; avatarColor: string };
	}[];
}

function formatDate(d: string | Date) {
	return new Date(d).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

const CATEGORY_ICONS: Record<string, string> = {
	groceries: "🛒",
	utilities: "⚡",
	rent: "🏠",
	entertainment: "🎬",
	transportation: "🚗",
	healthcare: "💊",
	dining: "🍽",
	other: "📦",
};

export function ExpensesPage() {
	const { data: expenses, loading, refetch } = useApi<IExpense[]>("/expenses");
	const { data: summary } = useApi<ExpenseSummary>("/expenses/summary");
	const [showNew, setShowNew] = useState(false);

	if (loading) return <Spinner />;

	return (
		<div className="animate-in">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h2 className="font-display text-2xl">Expenses</h2>
					<p className="text-sm text-text-secondary mt-0.5">
						Track household spending
					</p>
				</div>
				<Button onClick={() => setShowNew(true)}>+ New Expense</Button>
			</div>

			{/* Summary cards */}
			{summary && (
				<div className="grid grid-cols-3 gap-4 mb-6">
					<Card>
						<div className="text-xs text-text-tertiary uppercase tracking-wider font-medium">
							Total Spent
						</div>
						<div className="text-2xl font-display text-amber-accent mt-1">
							${summary.total.toFixed(2)}
						</div>
						<div className="text-xs text-text-tertiary mt-0.5">
							{summary.count} expenses
						</div>
					</Card>

					{/* By category breakdown */}
					<Card className="col-span-2">
						<CardHeader title="By Category" />
						<div className="flex flex-wrap gap-2">
							{summary.byCategory.map((cat) => (
								<div
									key={cat._id}
									className="flex items-center gap-1.5 bg-bg-elevated rounded-lg px-2.5 py-1.5"
								>
									<span className="text-sm">
										{CATEGORY_ICONS[cat._id] || "📦"}
									</span>
									<span className="text-xs font-medium capitalize">
										{cat._id}
									</span>
									<span className="text-xs text-amber-accent font-medium">
										${cat.total.toFixed(0)}
									</span>
								</div>
							))}
						</div>
					</Card>
				</div>
			)}

			{/* Member breakdown */}
			{summary && summary.byMember.length > 0 && (
				<Card className="mb-6">
					<CardHeader title="By Member" />
					<div className="space-y-2">
						{summary.byMember.map((m) => {
							const pct =
								summary.total > 0 ? (m.total / summary.total) * 100 : 0;
							return (
								<div key={m._id} className="flex items-center gap-3">
									<div
										className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-text-inverse shrink-0"
										style={{ backgroundColor: m.user.avatarColor }}
									>
										{m.user.name.charAt(0).toUpperCase()}
									</div>
									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between mb-1">
											<span className="text-sm font-medium">{m.user.name}</span>
											<span className="text-xs text-text-secondary">
												${m.total.toFixed(2)}
											</span>
										</div>
										<div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
											<div
												className="h-full bg-amber-accent rounded-full transition-all"
												style={{ width: `${pct}%` }}
											/>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</Card>
			)}

			{/* Expense list */}
			{!expenses?.length ? (
				<Empty
					icon={
						<svg
							width="40"
							height="40"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
						>
							<path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2-3-2z" />
							<line x1="8" y1="10" x2="16" y2="10" />
							<line x1="8" y1="14" x2="13" y2="14" />
						</svg>
					}
					title="No expenses"
					description="Start logging your household spending"
					action={<Button onClick={() => setShowNew(true)}>Add Expense</Button>}
				/>
			) : (
				<div className="space-y-2">
					{expenses.map((expense) => (
						<Card key={expense._id} className="flex items-center gap-4 !p-4">
							<div className="w-10 h-10 rounded-lg bg-bg-elevated flex items-center justify-center text-lg shrink-0">
								{CATEGORY_ICONS[expense.category] || "📦"}
							</div>
							<div className="flex-1 min-w-0">
								<div className="text-sm font-medium">{expense.description}</div>
								<div className="text-xs text-text-tertiary capitalize">
									{expense.category} · {formatDate(expense.date)}
								</div>
							</div>
							<div className="text-sm font-medium text-amber-accent">
								${expense.amount.toFixed(2)}
							</div>
							<button
								type="button"
								onClick={async () => {
									await apiDelete(`/expenses/${expense._id}`);
									refetch();
								}}
								className="text-text-tertiary hover:text-danger transition-colors p-1"
							>
								<svg
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<polyline points="3 6 5 6 21 6" />
									<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
								</svg>
							</button>
						</Card>
					))}
				</div>
			)}

			<NewExpenseModal
				open={showNew}
				onClose={() => setShowNew(false)}
				onCreated={refetch}
			/>
		</div>
	);
}

function NewExpenseModal({
	open,
	onClose,
	onCreated,
}: {
	open: boolean;
	onClose: () => void;
	onCreated: () => void;
}) {
	const [amount, setAmount] = useState("");
	const [category, setCategory] = useState("groceries");
	const [description, setDescription] = useState("");
	const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await apiPost("/expenses", {
				amount: Number.parseFloat(amount),
				category,
				description,
				date,
			});
			setAmount("");
			setDescription("");
			onCreated();
			onClose();
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal open={open} onClose={onClose} title="New Expense">
			<form onSubmit={handleSubmit} className="space-y-4">
				<Input
					label="Amount"
					type="number"
					step="0.01"
					min="0"
					value={amount}
					onChange={(e) => setAmount(e.target.value)}
					placeholder="0.00"
					required
				/>
				<Select
					label="Category"
					value={category}
					onChange={(e) => setCategory(e.target.value)}
				>
					{EXPENSE_CATEGORIES.map((c) => (
						<option key={c} value={c}>
							{CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}
						</option>
					))}
				</Select>
				<Input
					label="Description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="What was this for?"
					required
				/>
				<Input
					label="Date"
					type="date"
					value={date}
					onChange={(e) => setDate(e.target.value)}
					required
				/>
				<div className="flex gap-3 pt-2">
					<Button
						type="button"
						variant="secondary"
						onClick={onClose}
						className="flex-1"
					>
						Cancel
					</Button>
					<Button type="submit" disabled={loading} className="flex-1">
						{loading ? "Saving..." : "Add Expense"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}

import { type FormEvent, useState } from "react";
import type { ITask } from "shared";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Empty, Spinner } from "../components/Empty";
import { Input, Select } from "../components/Input";
import { Modal } from "../components/Modal";
import { apiDelete, apiPost, useApi } from "../hooks/useApi";

function formatDate(d: string | Date) {
	return new Date(d).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function statusColor(s: string) {
	if (s === "done") return "green";
	if (s === "in-progress") return "amber";
	return "gray";
}

export function TasksPage() {
	const { data: tasks, loading, refetch } = useApi<ITask[]>("/tasks");
	const [showNew, setShowNew] = useState(false);
	const [filter, setFilter] = useState<string>("all");

	const filtered =
		filter === "all"
			? tasks || []
			: (tasks || []).filter((t) => t.status === filter);

	if (loading) return <Spinner />;

	return (
		<div className="animate-in">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h2 className="font-display text-2xl">Tasks</h2>
					<p className="text-sm text-text-secondary mt-0.5">
						{tasks?.length ?? 0} total tasks
					</p>
				</div>
				<Button onClick={() => setShowNew(true)}>+ New Task</Button>
			</div>

			{/* Filters */}
			<div className="flex gap-2 mb-5">
				{["all", "pending", "in-progress", "done"].map((s) => (
					<button
						type="button"
						key={s}
						onClick={() => setFilter(s)}
						className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
							filter === s
								? "bg-amber-glow text-amber-accent"
								: "text-text-secondary hover:text-text-primary bg-bg-raised"
						}`}
					>
						{s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
					</button>
				))}
			</div>

			{filtered.length === 0 ? (
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
							<polyline points="9 11 12 14 22 4" />
							<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
						</svg>
					}
					title="No tasks"
					description={
						filter === "all" ? "Create your first task" : `No ${filter} tasks`
					}
					action={
						filter === "all" ? (
							<Button onClick={() => setShowNew(true)}>Create Task</Button>
						) : undefined
					}
				/>
			) : (
				<div className="space-y-2">
					{filtered.map((task) => (
						<TaskRow
							key={task._id}
							task={task}
							onComplete={async () => {
								await apiPost(`/tasks/${task._id}/complete`, {});
								refetch();
							}}
							onDelete={async () => {
								await apiDelete(`/tasks/${task._id}`);
								refetch();
							}}
						/>
					))}
				</div>
			)}

			<NewTaskModal
				open={showNew}
				onClose={() => setShowNew(false)}
				onCreated={refetch}
			/>
		</div>
	);
}

function TaskRow({
	task,
	onComplete,
	onDelete,
}: {
	task: ITask;
	onComplete: () => void;
	onDelete: () => void;
}) {
	const isOverdue =
		task.status !== "done" && new Date(task.dueDate) < new Date();

	return (
		<Card className="flex items-center gap-4 !p-4">
			{/* Complete checkbox */}
			<button
				type="button"
				onClick={task.status !== "done" ? onComplete : undefined}
				className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
					task.status === "done"
						? "bg-success/20 border-success text-success"
						: "border-border-strong hover:border-amber-accent"
				}`}
			>
				{task.status === "done" && (
					<svg
						width="12"
						height="12"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="3"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polyline points="20 6 9 17 4 12" />
					</svg>
				)}
			</button>

			<div className="flex-1 min-w-0">
				<div
					className={`text-sm font-medium ${task.status === "done" ? "line-through text-text-tertiary" : ""}`}
				>
					{task.title}
				</div>
				<div className="flex items-center gap-2 mt-0.5">
					<span
						className={`text-xs ${isOverdue ? "text-danger" : "text-text-tertiary"}`}
					>
						{isOverdue ? "Overdue · " : ""}Due {formatDate(task.dueDate)}
					</span>
					{task.recurrence !== "none" && (
						<Badge color="blue">{task.recurrence}</Badge>
					)}
				</div>
			</div>

			<Badge color={statusColor(task.status)}>{task.status}</Badge>

			<button
				type="button"
				onClick={onDelete}
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
	);
}

function NewTaskModal({
	open,
	onClose,
	onCreated,
}: {
	open: boolean;
	onClose: () => void;
	onCreated: () => void;
}) {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [dueDate, setDueDate] = useState("");
	const [recurrence, setRecurrence] = useState("none");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await apiPost("/tasks", {
				title,
				description: description || undefined,
				assignedTo: [],
				dueDate,
				recurrence,
			});
			setTitle("");
			setDescription("");
			setDueDate("");
			setRecurrence("none");
			onCreated();
			onClose();
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal open={open} onClose={onClose} title="New Task">
			<form onSubmit={handleSubmit} className="space-y-4">
				<Input
					label="Title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="What needs to be done?"
					required
				/>
				<Input
					label="Description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Optional details"
				/>
				<Input
					label="Due Date"
					type="date"
					value={dueDate}
					onChange={(e) => setDueDate(e.target.value)}
					required
				/>
				<Select
					label="Recurrence"
					value={recurrence}
					onChange={(e) => setRecurrence(e.target.value)}
				>
					<option value="none">None</option>
					<option value="daily">Daily</option>
					<option value="weekly">Weekly</option>
					<option value="monthly">Monthly</option>
				</Select>
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
						{loading ? "Creating..." : "Create Task"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}

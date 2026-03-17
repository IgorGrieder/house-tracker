import type { IEvent, IExpense, ITask } from "shared";
import { Badge } from "../components/Badge";
import { Card, CardHeader } from "../components/Card";
import { Spinner } from "../components/Empty";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../store/auth";

function formatDate(d: string | Date) {
	return new Date(d).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

function statusColor(status: string) {
	if (status === "done") return "green";
	if (status === "in-progress") return "amber";
	return "gray";
}

export function DashboardPage() {
	const { user } = useAuth();
	const { data: tasks, loading: tLoading } = useApi<ITask[]>(
		"/tasks?status=pending",
	);
	const { data: events, loading: eLoading } = useApi<IEvent[]>("/events");
	const { data: expenses, loading: xLoading } = useApi<IExpense[]>("/expenses");

	if (tLoading || eLoading || xLoading) return <Spinner />;

	const upcomingTasks = (tasks || []).slice(0, 5);
	const upcomingEvents = (events || []).slice(0, 5);
	const recentExpenses = (expenses || []).slice(0, 5);
	const totalExpenses = (expenses || []).reduce((s, e) => s + e.amount, 0);

	return (
		<div className="animate-in">
			{/* Header */}
			<div className="mb-8">
				<h2 className="font-display text-2xl">
					Good{" "}
					{new Date().getHours() < 12
						? "morning"
						: new Date().getHours() < 18
							? "afternoon"
							: "evening"}
					,{" "}
					<span className="text-amber-accent">{user?.name?.split(" ")[0]}</span>
				</h2>
				<p className="text-sm text-text-secondary mt-1">
					Here's what's happening at home
				</p>
			</div>

			{/* Stats row */}
			<div className="grid grid-cols-3 gap-4 mb-6">
				<Card>
					<div className="text-xs text-text-tertiary uppercase tracking-wider font-medium">
						Open Tasks
					</div>
					<div className="text-2xl font-display text-amber-accent mt-1">
						{tasks?.length ?? 0}
					</div>
				</Card>
				<Card>
					<div className="text-xs text-text-tertiary uppercase tracking-wider font-medium">
						Upcoming Events
					</div>
					<div className="text-2xl font-display text-info mt-1">
						{events?.length ?? 0}
					</div>
				</Card>
				<Card>
					<div className="text-xs text-text-tertiary uppercase tracking-wider font-medium">
						Total Expenses
					</div>
					<div className="text-2xl font-display text-success mt-1">
						${totalExpenses.toFixed(0)}
					</div>
				</Card>
			</div>

			{/* Content grid */}
			<div className="grid grid-cols-2 gap-4">
				{/* Tasks */}
				<Card>
					<CardHeader title="Pending Tasks" />
					{upcomingTasks.length === 0 ? (
						<p className="text-sm text-text-tertiary">All caught up!</p>
					) : (
						<div className="space-y-2">
							{upcomingTasks.map((task) => (
								<div
									key={task._id}
									className="flex items-center gap-3 p-2.5 rounded-lg bg-bg-elevated/50"
								>
									<div className="flex-1 min-w-0">
										<div className="text-sm font-medium truncate">
											{task.title}
										</div>
										<div className="text-xs text-text-tertiary">
											Due {formatDate(task.dueDate)}
										</div>
									</div>
									<Badge color={statusColor(task.status)}>{task.status}</Badge>
								</div>
							))}
						</div>
					)}
				</Card>

				{/* Events */}
				<Card>
					<CardHeader title="Upcoming Events" />
					{upcomingEvents.length === 0 ? (
						<p className="text-sm text-text-tertiary">Nothing planned</p>
					) : (
						<div className="space-y-2">
							{upcomingEvents.map((event) => (
								<div
									key={event._id}
									className="flex items-center gap-3 p-2.5 rounded-lg bg-bg-elevated/50"
								>
									<div className="w-10 h-10 rounded-lg bg-info/10 text-info flex flex-col items-center justify-center text-xs shrink-0">
										<span className="font-bold leading-none">
											{new Date(event.startDate).getDate()}
										</span>
										<span className="text-[9px] uppercase">
											{new Date(event.startDate).toLocaleDateString("en-US", {
												month: "short",
											})}
										</span>
									</div>
									<div className="flex-1 min-w-0">
										<div className="text-sm font-medium truncate">
											{event.title}
										</div>
										<div className="text-xs text-text-tertiary">
											{formatDate(event.startDate)}
											{event.allDay ? " · All day" : ""}
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</Card>

				{/* Recent Expenses — full width */}
				<Card className="col-span-2">
					<CardHeader title="Recent Expenses" />
					{recentExpenses.length === 0 ? (
						<p className="text-sm text-text-tertiary">No expenses recorded</p>
					) : (
						<div className="space-y-2">
							{recentExpenses.map((expense) => (
								<div
									key={expense._id}
									className="flex items-center gap-3 p-2.5 rounded-lg bg-bg-elevated/50"
								>
									<div className="flex-1 min-w-0">
										<div className="text-sm font-medium">
											{expense.description}
										</div>
										<div className="text-xs text-text-tertiary">
											{expense.category} · {formatDate(expense.date)}
										</div>
									</div>
									<div className="text-sm font-medium text-amber-accent">
										${expense.amount.toFixed(2)}
									</div>
								</div>
							))}
						</div>
					)}
				</Card>
			</div>
		</div>
	);
}

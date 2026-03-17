import { type FormEvent, useState } from "react";
import type { IEvent } from "shared";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Empty, Spinner } from "../components/Empty";
import { Input, Select } from "../components/Input";
import { Modal } from "../components/Modal";
import { apiDelete, apiPost, useApi } from "../hooks/useApi";

function formatRange(
	start: string | Date,
	end: string | Date,
	allDay: boolean,
) {
	const s = new Date(start);
	const e = new Date(end);
	const fmt: Intl.DateTimeFormatOptions = allDay
		? { month: "short", day: "numeric" }
		: { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" };
	const startStr = s.toLocaleDateString("en-US", fmt);
	const endStr = e.toLocaleDateString("en-US", fmt);
	if (startStr === endStr) return startStr + (allDay ? " · All day" : "");
	return `${startStr} — ${endStr}`;
}

export function EventsPage() {
	const { data: events, loading, refetch } = useApi<IEvent[]>("/events");
	const [showNew, setShowNew] = useState(false);

	if (loading) return <Spinner />;

	return (
		<div className="animate-in">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h2 className="font-display text-2xl">Events</h2>
					<p className="text-sm text-text-secondary mt-0.5">
						{events?.length ?? 0} events
					</p>
				</div>
				<Button onClick={() => setShowNew(true)}>+ New Event</Button>
			</div>

			{!events?.length ? (
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
							<rect x="3" y="4" width="18" height="18" rx="2" />
							<line x1="16" y1="2" x2="16" y2="6" />
							<line x1="8" y1="2" x2="8" y2="6" />
							<line x1="3" y1="10" x2="21" y2="10" />
						</svg>
					}
					title="No events yet"
					description="Plan your household events"
					action={
						<Button onClick={() => setShowNew(true)}>Create Event</Button>
					}
				/>
			) : (
				<div className="space-y-2">
					{events.map((event) => (
						<Card key={event._id} className="flex items-center gap-4 !p-4">
							<div className="w-12 h-12 rounded-xl bg-info/10 text-info flex flex-col items-center justify-center shrink-0">
								<span className="text-lg font-bold leading-none">
									{new Date(event.startDate).getDate()}
								</span>
								<span className="text-[9px] uppercase font-medium">
									{new Date(event.startDate).toLocaleDateString("en-US", {
										month: "short",
									})}
								</span>
							</div>
							<div className="flex-1 min-w-0">
								<div className="text-sm font-medium">{event.title}</div>
								<div className="text-xs text-text-tertiary mt-0.5">
									{formatRange(event.startDate, event.endDate, event.allDay)}
								</div>
								{event.description && (
									<div className="text-xs text-text-secondary mt-1 truncate">
										{event.description}
									</div>
								)}
							</div>
							{event.recurrence !== "none" && (
								<span className="text-xs text-info bg-info/10 px-2 py-0.5 rounded-md">
									{event.recurrence}
								</span>
							)}
							<button
								type="button"
								onClick={async () => {
									await apiDelete(`/events/${event._id}`);
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

			<NewEventModal
				open={showNew}
				onClose={() => setShowNew(false)}
				onCreated={refetch}
			/>
		</div>
	);
}

function NewEventModal({
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
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [allDay, setAllDay] = useState(true);
	const [recurrence, setRecurrence] = useState("none");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await apiPost("/events", {
				title,
				description: description || undefined,
				startDate,
				endDate: endDate || startDate,
				allDay,
				recurrence,
			});
			setTitle("");
			setDescription("");
			setStartDate("");
			setEndDate("");
			onCreated();
			onClose();
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal open={open} onClose={onClose} title="New Event">
			<form onSubmit={handleSubmit} className="space-y-4">
				<Input
					label="Title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="Event name"
					required
				/>
				<Input
					label="Description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Optional"
				/>
				<div className="grid grid-cols-2 gap-3">
					<Input
						label="Start Date"
						type={allDay ? "date" : "datetime-local"}
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						required
					/>
					<Input
						label="End Date"
						type={allDay ? "date" : "datetime-local"}
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
					/>
				</div>
				<label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
					<input
						type="checkbox"
						checked={allDay}
						onChange={(e) => setAllDay(e.target.checked)}
						className="rounded accent-amber-accent"
					/>
					All day event
				</label>
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
						{loading ? "Creating..." : "Create Event"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}

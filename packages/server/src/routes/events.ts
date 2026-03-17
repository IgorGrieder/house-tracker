import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth";
import { Event } from "../models/Event";

export const eventRoutes = new Elysia({ prefix: "/events" })
	.use(authMiddleware)

	// Get events for household within a date range
	.get("/", async ({ user, query }) => {
		const filter: Record<string, unknown> = { householdId: user.householdId };

		if (query.from || query.to) {
			const dateFilter: { $gte?: Date; $lte?: Date } = {};
			if (query.from) dateFilter.$gte = new Date(query.from);
			if (query.to) dateFilter.$lte = new Date(query.to);
			filter.startDate = dateFilter;
		}

		if (query.assignedTo) {
			filter.assignedTo = query.assignedTo;
		}

		return Event.find(filter)
			.populate("assignedTo", "name avatarColor")
			.populate("createdBy", "name")
			.sort({ startDate: 1 });
	})

	// Create event
	.post(
		"/",
		async ({ user, body }) => {
			const event = new Event({
				...body,
				startDate: new Date(body.startDate),
				endDate: new Date(body.endDate),
				householdId: user.householdId,
				createdBy: user.userId,
			});
			await event.save();
			return event.populate("assignedTo", "name avatarColor");
		},
		{
			body: t.Object({
				title: t.String({ minLength: 1 }),
				description: t.Optional(t.String()),
				startDate: t.String(),
				endDate: t.String(),
				allDay: t.Optional(t.Boolean()),
				recurrence: t.Optional(
					t.Union([
						t.Literal("none"),
						t.Literal("daily"),
						t.Literal("weekly"),
						t.Literal("monthly"),
					]),
				),
				assignedTo: t.Optional(t.Array(t.String())),
			}),
		},
	)

	// Get single event
	.get("/:id", async ({ user, params, set }) => {
		const event = await Event.findOne({
			_id: params.id,
			householdId: user.householdId,
		})
			.populate("assignedTo", "name avatarColor")
			.populate("createdBy", "name");
		if (!event) {
			set.status = 404;
			return { error: "Event not found" };
		}
		return event;
	})

	// Update event
	.patch(
		"/:id",
		async ({ user, params, body, set }) => {
			const updates: Record<string, unknown> = { ...body };
			if (body.startDate) updates.startDate = new Date(body.startDate);
			if (body.endDate) updates.endDate = new Date(body.endDate);

			const event = await Event.findOneAndUpdate(
				{ _id: params.id, householdId: user.householdId },
				updates,
				{ new: true },
			).populate("assignedTo", "name avatarColor");
			if (!event) {
				set.status = 404;
				return { error: "Event not found" };
			}
			return event;
		},
		{
			body: t.Object({
				title: t.Optional(t.String({ minLength: 1 })),
				description: t.Optional(t.String()),
				startDate: t.Optional(t.String()),
				endDate: t.Optional(t.String()),
				allDay: t.Optional(t.Boolean()),
				recurrence: t.Optional(
					t.Union([
						t.Literal("none"),
						t.Literal("daily"),
						t.Literal("weekly"),
						t.Literal("monthly"),
					]),
				),
				assignedTo: t.Optional(t.Array(t.String())),
			}),
		},
	)

	// Delete event
	.delete("/:id", async ({ user, params, set }) => {
		const result = await Event.findOneAndDelete({
			_id: params.id,
			householdId: user.householdId,
		});
		if (!result) {
			set.status = 404;
			return { error: "Event not found" };
		}
		set.status = 204;
	});

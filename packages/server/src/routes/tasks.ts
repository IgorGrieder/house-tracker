import { Elysia, t } from "elysia";
import mongoose from "mongoose";
import { authMiddleware } from "../middleware/auth";
import { Task } from "../models/Task";

export const taskRoutes = new Elysia({ prefix: "/tasks" })
	.use(authMiddleware)

	// Get all tasks for household
	.get("/", async ({ user, query }) => {
		const filter: Record<string, unknown> = { householdId: user.householdId };
		if (query.status) {
			filter.status = query.status;
		}
		if (query.assignedTo) {
			filter.assignedTo = query.assignedTo;
		}
		return Task.find(filter)
			.populate("assignedTo", "name avatarColor")
			.populate("completedBy", "name")
			.sort({ dueDate: 1 });
	})

	// Create task
	.post(
		"/",
		async ({ user, body }) => {
			const task = new Task({
				...body,
				householdId: user.householdId,
				createdBy: user.userId,
			});
			await task.save();
			return task.populate("assignedTo", "name avatarColor");
		},
		{
			body: t.Object({
				title: t.String({ minLength: 1 }),
				description: t.Optional(t.String()),
				assignedTo: t.Array(t.String()),
				dueDate: t.String(),
				recurrence: t.Optional(
					t.Union([
						t.Literal("none"),
						t.Literal("daily"),
						t.Literal("weekly"),
						t.Literal("monthly"),
					]),
				),
			}),
		},
	)

	// Get single task
	.get("/:id", async ({ user, params, set }) => {
		const task = await Task.findOne({
			_id: params.id,
			householdId: user.householdId,
		})
			.populate("assignedTo", "name avatarColor")
			.populate("completedBy", "name");
		if (!task) {
			set.status = 404;
			return { error: "Task not found" };
		}
		return task;
	})

	// Update task
	.patch(
		"/:id",
		async ({ user, params, body, set }) => {
			const task = await Task.findOneAndUpdate(
				{ _id: params.id, householdId: user.householdId },
				body,
				{ new: true },
			).populate("assignedTo", "name avatarColor");
			if (!task) {
				set.status = 404;
				return { error: "Task not found" };
			}
			return task;
		},
		{
			body: t.Object({
				title: t.Optional(t.String({ minLength: 1 })),
				description: t.Optional(t.String()),
				assignedTo: t.Optional(t.Array(t.String())),
				dueDate: t.Optional(t.String()),
				recurrence: t.Optional(
					t.Union([
						t.Literal("none"),
						t.Literal("daily"),
						t.Literal("weekly"),
						t.Literal("monthly"),
					]),
				),
			}),
		},
	)

	// Complete task
	.post("/:id/complete", async ({ user, params, set }) => {
		const task = await Task.findOne({
			_id: params.id,
			householdId: user.householdId,
		});
		if (!task) {
			set.status = 404;
			return { error: "Task not found" };
		}

		task.status = "done";
		task.completedBy = new mongoose.Types.ObjectId(user.userId);
		task.completedAt = new Date();
		await task.save();

		// If recurring, create the next occurrence
		if (task.recurrence !== "none") {
			const nextDueDate = new Date(task.dueDate);
			switch (task.recurrence) {
				case "daily":
					nextDueDate.setDate(nextDueDate.getDate() + 1);
					break;
				case "weekly":
					nextDueDate.setDate(nextDueDate.getDate() + 7);
					break;
				case "monthly":
					nextDueDate.setMonth(nextDueDate.getMonth() + 1);
					break;
			}

			const nextTask = new Task({
				title: task.title,
				description: task.description,
				assignedTo: task.assignedTo,
				dueDate: nextDueDate,
				recurrence: task.recurrence,
				householdId: task.householdId,
				createdBy: task.createdBy,
			});
			await nextTask.save();
		}

		return task.populate("completedBy", "name");
	})

	// Delete task
	.delete("/:id", async ({ user, params, set }) => {
		const result = await Task.findOneAndDelete({
			_id: params.id,
			householdId: user.householdId,
		});
		if (!result) {
			set.status = 404;
			return { error: "Task not found" };
		}
		set.status = 204;
	});

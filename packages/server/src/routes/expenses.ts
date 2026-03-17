import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth";
import { Expense } from "../models/Expense";

export const expenseRoutes = new Elysia({ prefix: "/expenses" })
	.use(authMiddleware)

	// Get expenses for household
	.get("/", async ({ user, query }) => {
		const filter: Record<string, unknown> = { householdId: user.householdId };

		if (query.from || query.to) {
			const dateFilter: { $gte?: Date; $lte?: Date } = {};
			if (query.from) dateFilter.$gte = new Date(query.from);
			if (query.to) dateFilter.$lte = new Date(query.to);
			filter.date = dateFilter;
		}
		if (query.category) {
			filter.category = query.category;
		}
		if (query.paidBy) {
			filter.paidBy = query.paidBy;
		}

		return Expense.find(filter)
			.populate("paidBy", "name avatarColor")
			.sort({ date: -1 });
	})

	// Get summary (totals by category, by member)
	.get("/summary", async ({ user, query }) => {
		const match: Record<string, unknown> = { householdId: user.householdId };
		if (query.from || query.to) {
			const dateFilter: { $gte?: Date; $lte?: Date } = {};
			if (query.from) dateFilter.$gte = new Date(query.from);
			if (query.to) dateFilter.$lte = new Date(query.to);
			match.date = dateFilter;
		}

		const [byCategory, byMember, total] = await Promise.all([
			Expense.aggregate([
				{ $match: match },
				{
					$group: {
						_id: "$category",
						total: { $sum: "$amount" },
						count: { $sum: 1 },
					},
				},
				{ $sort: { total: -1 } },
			]),
			Expense.aggregate([
				{ $match: match },
				{
					$group: {
						_id: "$paidBy",
						total: { $sum: "$amount" },
						count: { $sum: 1 },
					},
				},
				{
					$lookup: {
						from: "users",
						localField: "_id",
						foreignField: "_id",
						as: "user",
						pipeline: [{ $project: { name: 1, avatarColor: 1 } }],
					},
				},
				{ $unwind: "$user" },
				{ $sort: { total: -1 } },
			]),
			Expense.aggregate([
				{ $match: match },
				{
					$group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } },
				},
			]),
		]);

		return {
			total: total[0]?.total ?? 0,
			count: total[0]?.count ?? 0,
			byCategory,
			byMember,
		};
	})

	// Create expense
	.post(
		"/",
		async ({ user, body }) => {
			const expense = new Expense({
				...body,
				date: new Date(body.date),
				paidBy: body.paidBy || user.userId,
				householdId: user.householdId,
				createdBy: user.userId,
			});
			await expense.save();
			return expense.populate("paidBy", "name avatarColor");
		},
		{
			body: t.Object({
				amount: t.Number({ minimum: 0 }),
				category: t.String(),
				description: t.String({ minLength: 1 }),
				date: t.String(),
				paidBy: t.Optional(t.String()),
			}),
		},
	)

	// Update expense
	.patch(
		"/:id",
		async ({ user, params, body, set }) => {
			const updates: Record<string, unknown> = { ...body };
			if (body.date) updates.date = new Date(body.date);

			const expense = await Expense.findOneAndUpdate(
				{ _id: params.id, householdId: user.householdId },
				updates,
				{ new: true },
			).populate("paidBy", "name avatarColor");
			if (!expense) {
				set.status = 404;
				return { error: "Expense not found" };
			}
			return expense;
		},
		{
			body: t.Object({
				amount: t.Optional(t.Number({ minimum: 0 })),
				category: t.Optional(t.String()),
				description: t.Optional(t.String({ minLength: 1 })),
				date: t.Optional(t.String()),
				paidBy: t.Optional(t.String()),
			}),
		},
	)

	// Delete expense
	.delete("/:id", async ({ user, params, set }) => {
		const result = await Expense.findOneAndDelete({
			_id: params.id,
			householdId: user.householdId,
		});
		if (!result) {
			set.status = 404;
			return { error: "Expense not found" };
		}
		set.status = 204;
	});

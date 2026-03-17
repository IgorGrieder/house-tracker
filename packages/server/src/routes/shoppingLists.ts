import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth";
import { ShoppingList } from "../models/ShoppingList";

export const shoppingListRoutes = new Elysia({ prefix: "/shopping-lists" })
	.use(authMiddleware)

	// Get all lists for household
	.get("/", async ({ user, query }) => {
		const filter: Record<string, unknown> = { householdId: user.householdId };
		if (query.archived !== "true") {
			filter.archived = false;
		}
		return ShoppingList.find(filter).sort({ _id: -1 });
	})

	// Create a new list
	.post(
		"/",
		async ({ user, body }) => {
			const list = new ShoppingList({
				name: body.name,
				householdId: user.householdId,
				createdBy: user.userId,
			});
			await list.save();
			return list;
		},
		{
			body: t.Object({ name: t.String({ minLength: 1 }) }),
		},
	)

	// Get single list
	.get("/:id", async ({ user, params, set }) => {
		const list = await ShoppingList.findOne({
			_id: params.id,
			householdId: user.householdId,
		});
		if (!list) {
			set.status = 404;
			return { error: "List not found" };
		}
		return list;
	})

	// Update list (name, archived)
	.patch(
		"/:id",
		async ({ user, params, body, set }) => {
			const list = await ShoppingList.findOneAndUpdate(
				{ _id: params.id, householdId: user.householdId },
				body,
				{ new: true },
			);
			if (!list) {
				set.status = 404;
				return { error: "List not found" };
			}
			return list;
		},
		{
			body: t.Object({
				name: t.Optional(t.String({ minLength: 1 })),
				archived: t.Optional(t.Boolean()),
			}),
		},
	)

	// Delete list
	.delete("/:id", async ({ user, params, set }) => {
		const result = await ShoppingList.findOneAndDelete({
			_id: params.id,
			householdId: user.householdId,
		});
		if (!result) {
			set.status = 404;
			return { error: "List not found" };
		}
		set.status = 204;
	})

	// Add item to list
	.post(
		"/:id/items",
		async ({ user, params, body, set }) => {
			const list = await ShoppingList.findOneAndUpdate(
				{ _id: params.id, householdId: user.householdId },
				{
					$push: {
						items: { ...body, addedBy: user.userId },
					},
				},
				{ new: true },
			);
			if (!list) {
				set.status = 404;
				return { error: "List not found" };
			}
			return list;
		},
		{
			body: t.Object({
				name: t.String({ minLength: 1 }),
				quantity: t.Optional(t.Number({ minimum: 1 })),
				category: t.Optional(t.String()),
			}),
		},
	)

	// Toggle item checked status
	.patch("/:id/items/:itemId/toggle", async ({ user, params, set }) => {
		const list = await ShoppingList.findOne({
			_id: params.id,
			householdId: user.householdId,
		});
		if (!list) {
			set.status = 404;
			return { error: "List not found" };
		}

		const item = list.items.id(params.itemId);
		if (!item) {
			set.status = 404;
			return { error: "Item not found" };
		}

		item.checked = !item.checked;
		await list.save();
		return list;
	})

	// Remove item from list
	.delete("/:id/items/:itemId", async ({ user, params, set }) => {
		const list = await ShoppingList.findOneAndUpdate(
			{ _id: params.id, householdId: user.householdId },
			{ $pull: { items: { _id: params.itemId } } },
			{ new: true },
		);
		if (!list) {
			set.status = 404;
			return { error: "List not found" };
		}
		return list;
	})

	// Clear checked items
	.delete("/:id/items/checked", async ({ user, params, set }) => {
		const list = await ShoppingList.findOneAndUpdate(
			{ _id: params.id, householdId: user.householdId },
			{ $pull: { items: { checked: true } } },
			{ new: true },
		);
		if (!list) {
			set.status = 404;
			return { error: "List not found" };
		}
		return list;
	});

import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth";
import { Household } from "../models/Household";
import { User } from "../models/User";

export const householdRoutes = new Elysia({ prefix: "/household" })
	.use(authMiddleware)

	// Get current household with members
	.get("/", async ({ user, set }) => {
		const household = await Household.findById(user.householdId).populate(
			"members",
			"name email avatarColor role",
		);
		if (!household) {
			set.status = 404;
			return { error: "Household not found" };
		}
		return household;
	})

	// Update household name (admin only)
	.patch(
		"/",
		async ({ user, body, set }) => {
			if (user.role !== "admin") {
				set.status = 403;
				return { error: "Only admins can update the household" };
			}
			const household = await Household.findByIdAndUpdate(
				user.householdId,
				{ name: body.name },
				{ new: true },
			);
			return household;
		},
		{
			body: t.Object({ name: t.String({ minLength: 1 }) }),
		},
	)

	// Remove a member (admin only)
	.delete("/members/:memberId", async ({ user, params, set }) => {
		if (user.role !== "admin") {
			set.status = 403;
			return { error: "Only admins can remove members" };
		}
		if (params.memberId === user.userId) {
			set.status = 400;
			return { error: "Cannot remove yourself" };
		}

		await Household.findByIdAndUpdate(user.householdId, {
			$pull: { members: params.memberId },
		});
		await User.findByIdAndUpdate(params.memberId, {
			householdId: null,
		});

		return { success: true };
	});

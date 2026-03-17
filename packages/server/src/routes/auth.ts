import bcrypt from "bcryptjs";
import { Elysia, t } from "elysia";
import { authMiddleware } from "../middleware/auth";
import { Household, type HouseholdDocument } from "../models/Household";
import { User } from "../models/User";
import { nextAvatarColor } from "../utils/colors";
import {
	generateAccessToken,
	generateRefreshToken,
	type TokenPayload,
	verifyRefreshToken,
} from "../utils/tokens";

export const authRoutes = new Elysia({ prefix: "/auth" })
	// Register — first user creates household, becomes admin
	.post(
		"/register",
		async ({ body, set }) => {
			const { name, email, password, householdName, inviteCode } = body;

			const existing = await User.findOne({ email });
			if (existing) {
				set.status = 409;
				return { error: "Email already in use" };
			}

			const passwordHash = await bcrypt.hash(password, 12);
			const avatarColor = nextAvatarColor();

			let household: HouseholdDocument | null = null;
			let role: "admin" | "member" = "member";

			if (inviteCode) {
				// Join existing household by ID (simple invite)
				household = await Household.findById(inviteCode);
				if (!household) {
					set.status = 404;
					return { error: "Household not found" };
				}
			} else {
				// Create new household
				if (!householdName) {
					set.status = 400;
					return {
						error: "householdName is required when creating a new household",
					};
				}
				role = "admin";
				household = new Household({
					name: householdName,
					createdBy: null,
					members: [],
				});
			}

			const user = new User({
				name,
				email,
				passwordHash,
				role,
				householdId: household._id,
				avatarColor,
			});

			if (!inviteCode) {
				household.createdBy = user._id;
			}
			household.members.push(user._id);

			const accessToken = generateAccessToken({
				userId: user._id.toString(),
				householdId: household._id.toString(),
				role,
			});
			const refreshToken = generateRefreshToken({
				userId: user._id.toString(),
				householdId: household._id.toString(),
				role,
			});

			user.refreshTokens.push(refreshToken);

			await household.save();
			await user.save();

			return { user: user.toJSON(), accessToken, refreshToken };
		},
		{
			body: t.Object({
				name: t.String({ minLength: 1 }),
				email: t.String({ format: "email" }),
				password: t.String({ minLength: 6 }),
				householdName: t.Optional(t.String({ minLength: 1 })),
				inviteCode: t.Optional(t.String()),
			}),
		},
	)

	// Login
	.post(
		"/login",
		async ({ body, set }) => {
			const { email, password } = body;

			const user = await User.findOne({ email });
			if (!user) {
				set.status = 401;
				return { error: "Invalid credentials" };
			}

			const valid = await bcrypt.compare(password, user.passwordHash);
			if (!valid) {
				set.status = 401;
				return { error: "Invalid credentials" };
			}

			const payload = {
				userId: user._id.toString(),
				householdId: user.householdId.toString(),
				role: user.role,
			};

			const accessToken = generateAccessToken(payload);
			const refreshToken = generateRefreshToken(payload);

			user.refreshTokens.push(refreshToken);
			// Keep only the last 5 refresh tokens per user
			if (user.refreshTokens.length > 5) {
				user.refreshTokens = user.refreshTokens.slice(-5);
			}
			await user.save();

			return { user: user.toJSON(), accessToken, refreshToken };
		},
		{
			body: t.Object({
				email: t.String({ format: "email" }),
				password: t.String(),
			}),
		},
	)

	// Refresh — silent token rotation
	.post(
		"/refresh",
		async ({ body, set }) => {
			const { refreshToken } = body;

			let payload: TokenPayload;
			try {
				payload = verifyRefreshToken(refreshToken);
			} catch {
				set.status = 401;
				return { error: "Invalid refresh token" };
			}

			const user = await User.findById(payload.userId);
			if (!user || !user.refreshTokens.includes(refreshToken)) {
				// Token reuse detected — revoke all refresh tokens for security
				if (user) {
					user.refreshTokens = [];
					await user.save();
				}
				set.status = 401;
				return { error: "Token reuse detected, all sessions revoked" };
			}

			// Rotate: remove old token, issue new pair
			user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);

			const newPayload = {
				userId: user._id.toString(),
				householdId: user.householdId.toString(),
				role: user.role,
			};

			const newAccessToken = generateAccessToken(newPayload);
			const newRefreshToken = generateRefreshToken(newPayload);

			user.refreshTokens.push(newRefreshToken);
			await user.save();

			return { accessToken: newAccessToken, refreshToken: newRefreshToken };
		},
		{
			body: t.Object({
				refreshToken: t.String(),
			}),
		},
	)

	// Logout — revoke a specific refresh token
	.post(
		"/logout",
		async ({ body, set }) => {
			const { refreshToken } = body;

			let payload: TokenPayload;
			try {
				payload = verifyRefreshToken(refreshToken);
			} catch {
				set.status = 204;
				return;
			}

			const user = await User.findById(payload.userId);
			if (user) {
				user.refreshTokens = user.refreshTokens.filter(
					(t) => t !== refreshToken,
				);
				await user.save();
			}

			set.status = 204;
		},
		{
			body: t.Object({
				refreshToken: t.String(),
			}),
		},
	)

	// Get current user (protected)
	.use(authMiddleware)
	.get("/me", async ({ user, set }) => {
		const doc = await User.findById(user.userId);
		if (!doc) {
			set.status = 404;
			return { error: "User not found" };
		}
		return doc.toJSON();
	});

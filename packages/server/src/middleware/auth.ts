import { Elysia } from "elysia";
import { type TokenPayload, verifyAccessToken } from "../utils/tokens";

export const authMiddleware = new Elysia({ name: "auth" })
	.derive({ as: "scoped" }, ({ request }): { user: TokenPayload } => {
		const header = request.headers.get("authorization");
		if (!header?.startsWith("Bearer ")) {
			throw new Error("UNAUTHORIZED");
		}

		const token = header.slice(7);
		try {
			const payload = verifyAccessToken(token);
			return { user: payload };
		} catch {
			throw new Error("UNAUTHORIZED");
		}
	})
	.onError({ as: "scoped" }, ({ error, set }) => {
		if (error instanceof Error && error.message === "UNAUTHORIZED") {
			set.status = 401;
			return { error: "Unauthorized" };
		}
	});

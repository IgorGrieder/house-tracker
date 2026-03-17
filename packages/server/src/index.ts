import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { connectDB } from "./config/db";
import { env } from "./config/env";
import { authRoutes } from "./routes/auth";
import { eventRoutes } from "./routes/events";
import { expenseRoutes } from "./routes/expenses";
import { householdRoutes } from "./routes/household";
import { shoppingListRoutes } from "./routes/shoppingLists";
import { taskRoutes } from "./routes/tasks";

await connectDB();

new Elysia()
	.use(cors())
	.get("/health", () => ({ status: "ok" }))
	.group("/api", (app) =>
		app
			.use(authRoutes)
			.use(householdRoutes)
			.use(shoppingListRoutes)
			.use(taskRoutes)
			.use(eventRoutes)
			.use(expenseRoutes),
	)
	.listen(env.PORT);

console.log(`Server running at http://localhost:${env.PORT}`);

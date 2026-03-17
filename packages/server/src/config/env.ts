export const env = {
	MONGODB_URI:
		process.env.MONGODB_URI || "mongodb://localhost:27017/house-tracker",
	JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "access-secret-dev",
	JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "refresh-secret-dev",
	ACCESS_TOKEN_EXPIRY: "15m",
	REFRESH_TOKEN_EXPIRY: "7d",
	PORT: Number(process.env.PORT) || 3000,
};

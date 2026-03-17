import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface TokenPayload {
	userId: string;
	householdId: string;
	role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
	return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
		expiresIn: env.ACCESS_TOKEN_EXPIRY,
	});
}

export function generateRefreshToken(payload: TokenPayload): string {
	return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
		expiresIn: env.REFRESH_TOKEN_EXPIRY,
	});
}

export function verifyAccessToken(token: string): TokenPayload {
	return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
	return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}

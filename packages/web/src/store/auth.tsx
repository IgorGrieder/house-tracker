import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import type { IUser } from "shared";
import {
	apiFetch,
	clearTokens,
	loadRefreshToken,
	setTokens,
} from "../services/api";

interface AuthState {
	user: IUser | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (data: {
		name: string;
		email: string;
		password: string;
		householdName?: string;
		inviteCode?: string;
	}) => Promise<void>;
	logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<IUser | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadRefreshToken();
		apiFetch<IUser>("/auth/me")
			.then(setUser)
			.catch(() => setUser(null))
			.finally(() => setLoading(false));
	}, []);

	const login = useCallback(async (email: string, password: string) => {
		const res = await apiFetch<{
			user: IUser;
			accessToken: string;
			refreshToken: string;
		}>("/auth/login", {
			method: "POST",
			body: JSON.stringify({ email, password }),
		});
		setTokens(res.accessToken, res.refreshToken);
		setUser(res.user);
	}, []);

	const register = useCallback(
		async (data: {
			name: string;
			email: string;
			password: string;
			householdName?: string;
			inviteCode?: string;
		}) => {
			const res = await apiFetch<{
				user: IUser;
				accessToken: string;
				refreshToken: string;
			}>("/auth/register", {
				method: "POST",
				body: JSON.stringify(data),
			});
			setTokens(res.accessToken, res.refreshToken);
			setUser(res.user);
		},
		[],
	);

	const logout = useCallback(() => {
		clearTokens();
		setUser(null);
	}, []);

	return (
		<AuthContext.Provider value={{ user, loading, login, register, logout }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth(): AuthState {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}

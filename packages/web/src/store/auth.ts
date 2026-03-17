import type { IUser } from "shared";
import { create } from "zustand";
import api, { clearTokens, loadRefreshToken, setTokens } from "../services/api";

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
	hydrate: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
	user: null,
	loading: true,

	hydrate: async () => {
		loadRefreshToken();
		try {
			const { data } = await api.get<IUser>("/auth/me");
			set({ user: data, loading: false });
		} catch {
			set({ user: null, loading: false });
		}
	},

	login: async (email, password) => {
		const { data } = await api.post<{
			user: IUser;
			accessToken: string;
			refreshToken: string;
		}>("/auth/login", { email, password });
		setTokens(data.accessToken, data.refreshToken);
		set({ user: data.user });
	},

	register: async (body) => {
		const { data } = await api.post<{
			user: IUser;
			accessToken: string;
			refreshToken: string;
		}>("/auth/register", body);
		setTokens(data.accessToken, data.refreshToken);
		set({ user: data.user });
	},

	logout: () => {
		clearTokens();
		set({ user: null });
	},
}));

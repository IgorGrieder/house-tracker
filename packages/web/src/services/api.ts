import axios from "axios";

const api = axios.create({
	baseURL: "/api",
	headers: { "Content-Type": "application/json" },
});

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(access: string, refresh: string) {
	accessToken = access;
	refreshToken = refresh;
	localStorage.setItem("refreshToken", refresh);
}

export function loadRefreshToken() {
	refreshToken = localStorage.getItem("refreshToken");
}

export function clearTokens() {
	accessToken = null;
	refreshToken = null;
	localStorage.removeItem("refreshToken");
}

// Attach access token to every request
api.interceptors.request.use((config) => {
	if (accessToken) {
		config.headers.Authorization = `Bearer ${accessToken}`;
	}
	return config;
});

// On 401, attempt silent refresh and retry once
api.interceptors.response.use(
	(res) => res,
	async (error) => {
		const original = error.config;
		if (error.response?.status === 401 && refreshToken && !original._retry) {
			original._retry = true;
			try {
				const { data } = await axios.post("/api/auth/refresh", {
					refreshToken,
				});
				setTokens(data.accessToken, data.refreshToken);
				original.headers.Authorization = `Bearer ${accessToken}`;
				return api(original);
			} catch {
				clearTokens();
			}
		}
		return Promise.reject(error);
	},
);

export default api;

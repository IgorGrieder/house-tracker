const BASE_URL = "/api";

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

async function silentRefresh(): Promise<boolean> {
	if (!refreshToken) return false;

	try {
		const res = await fetch(`${BASE_URL}/auth/refresh`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refreshToken }),
		});

		if (!res.ok) {
			clearTokens();
			return false;
		}

		const data = await res.json();
		setTokens(data.accessToken, data.refreshToken);
		return true;
	} catch {
		clearTokens();
		return false;
	}
}

export async function apiFetch<T = unknown>(
	path: string,
	options: RequestInit = {},
): Promise<T> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...(options.headers as Record<string, string>),
	};

	if (accessToken) {
		headers.Authorization = `Bearer ${accessToken}`;
	}

	let res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

	// If 401, attempt silent refresh and retry once
	if (res.status === 401 && refreshToken) {
		const refreshed = await silentRefresh();
		if (refreshed) {
			headers.Authorization = `Bearer ${accessToken}`;
			res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
		}
	}

	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.error || `Request failed: ${res.status}`);
	}

	if (res.status === 204) return undefined as T;
	return res.json();
}

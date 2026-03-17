import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../services/api";

export function useApi<T>(path: string | null) {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(!!path);
	const [error, setError] = useState<string | null>(null);

	const refetch = useCallback(() => {
		if (!path) return;
		setLoading(true);
		setError(null);
		apiFetch<T>(path)
			.then(setData)
			.catch((e: Error) => setError(e.message))
			.finally(() => setLoading(false));
	}, [path]);

	useEffect(() => {
		refetch();
	}, [refetch]);

	return { data, loading, error, refetch, setData };
}

export async function apiPost<T = unknown>(
	path: string,
	body: unknown,
): Promise<T> {
	return apiFetch<T>(path, {
		method: "POST",
		body: JSON.stringify(body),
	});
}

export async function apiPatch<T = unknown>(
	path: string,
	body: unknown,
): Promise<T> {
	return apiFetch<T>(path, {
		method: "PATCH",
		body: JSON.stringify(body),
	});
}

export async function apiDelete(path: string): Promise<void> {
	return apiFetch(path, { method: "DELETE" });
}

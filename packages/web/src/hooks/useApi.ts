import type { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

export function useApi<T>(path: string | null) {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(!!path);
	const [error, setError] = useState<string | null>(null);

	const refetch = useCallback(() => {
		if (!path) return;
		setLoading(true);
		setError(null);
		api
			.get<T>(path)
			.then((res) => setData(res.data))
			.catch((e: AxiosError<{ error?: string }>) =>
				setError(e.response?.data?.error || e.message),
			)
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
	const { data } = await api.post<T>(path, body);
	return data;
}

export async function apiPatch<T = unknown>(
	path: string,
	body: unknown,
): Promise<T> {
	const { data } = await api.patch<T>(path, body);
	return data;
}

export async function apiDelete(path: string): Promise<void> {
	await api.delete(path);
}

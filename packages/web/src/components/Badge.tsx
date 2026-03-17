import type { ReactNode } from "react";

const colorMap: Record<string, string> = {
	amber: "bg-amber-glow text-amber-accent",
	green: "bg-success/15 text-success",
	red: "bg-danger/15 text-danger",
	blue: "bg-info/15 text-info",
	gray: "bg-bg-elevated text-text-secondary",
};

export function Badge({
	color = "gray",
	children,
}: {
	color?: string;
	children: ReactNode;
}) {
	return (
		<span
			className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${colorMap[color] || colorMap.gray}`}
		>
			{children}
		</span>
	);
}

export function Avatar({
	name,
	color,
	size = "sm",
}: {
	name: string;
	color: string;
	size?: "sm" | "md";
}) {
	const sizeClass = size === "md" ? "w-9 h-9 text-sm" : "w-6 h-6 text-[10px]";
	return (
		<div
			className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-text-inverse shrink-0`}
			style={{ backgroundColor: color }}
			title={name}
		>
			{name.charAt(0).toUpperCase()}
		</div>
	);
}

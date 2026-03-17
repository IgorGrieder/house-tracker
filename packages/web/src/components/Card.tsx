import type { ReactNode } from "react";

export function Card({
	children,
	className = "",
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={`bg-bg-raised border border-border-default rounded-xl p-5 ${className}`}
		>
			{children}
		</div>
	);
}

export function CardHeader({
	title,
	action,
}: {
	title: string;
	action?: ReactNode;
}) {
	return (
		<div className="flex items-center justify-between mb-4">
			<h3 className="font-display text-lg">{title}</h3>
			{action}
		</div>
	);
}

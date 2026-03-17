import type { ReactNode } from "react";

export function Empty({
	icon,
	title,
	description,
	action,
}: {
	icon: ReactNode;
	title: string;
	description: string;
	action?: ReactNode;
}) {
	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<div className="text-text-tertiary mb-3">{icon}</div>
			<h3 className="font-display text-lg text-text-primary mb-1">{title}</h3>
			<p className="text-sm text-text-secondary max-w-xs">{description}</p>
			{action && <div className="mt-4">{action}</div>}
		</div>
	);
}

export function Spinner() {
	return (
		<div className="flex items-center justify-center py-20">
			<div className="w-6 h-6 border-2 border-border-strong border-t-amber-accent rounded-full animate-spin" />
		</div>
	);
}

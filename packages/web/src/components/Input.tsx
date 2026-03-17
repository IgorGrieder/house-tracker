import type { InputHTMLAttributes } from "react";

export function Input({
	label,
	error,
	className = "",
	...props
}: {
	label?: string;
	error?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
	const input = (
		<input
			className="w-full bg-bg-elevated border border-border-default rounded-lg px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-amber-dim focus:ring-1 focus:ring-amber-glow transition-colors"
			{...props}
		/>
	);

	if (label) {
		return (
			<label className={`block ${className}`}>
				<span className="block text-sm font-medium text-text-secondary mb-1.5">
					{label}
				</span>
				{input}
				{error && <p className="text-xs text-danger mt-1">{error}</p>}
			</label>
		);
	}

	return (
		<div className={className}>
			{input}
			{error && <p className="text-xs text-danger mt-1">{error}</p>}
		</div>
	);
}

export function Select({
	label,
	children,
	className = "",
	...props
}: {
	label?: string;
	children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
	const select = (
		<select
			className="w-full bg-bg-elevated border border-border-default rounded-lg px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-amber-dim focus:ring-1 focus:ring-amber-glow transition-colors appearance-none"
			{...props}
		>
			{children}
		</select>
	);

	if (label) {
		return (
			<label className={`block ${className}`}>
				<span className="block text-sm font-medium text-text-secondary mb-1.5">
					{label}
				</span>
				{select}
			</label>
		);
	}

	return <div className={className}>{select}</div>;
}

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
	primary:
		"bg-amber-accent text-text-inverse hover:brightness-110 active:brightness-95 shadow-[0_0_20px_rgba(232,168,73,0.15)]",
	secondary:
		"bg-bg-elevated border border-border-strong text-text-primary hover:bg-bg-hover",
	ghost: "text-text-secondary hover:text-text-primary hover:bg-bg-hover",
	danger: "bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20",
};

export function Button({
	variant = "primary",
	children,
	className = "",
	...props
}: {
	variant?: Variant;
	children: ReactNode;
	className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
	return (
		<button
			className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
			{...props}
		>
			{children}
		</button>
	);
}

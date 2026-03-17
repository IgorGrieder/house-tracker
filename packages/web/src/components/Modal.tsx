import { type ReactNode, useEffect } from "react";

export function Modal({
	open,
	onClose,
	title,
	children,
}: {
	open: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
}) {
	useEffect(() => {
		if (!open) return;
		const handler = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			{/* biome-ignore lint/a11y/useSemanticElements: backdrop overlay, not interactive content */}
			<div
				role="button"
				tabIndex={0}
				className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				onClick={onClose}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") onClose();
				}}
			/>
			<div className="relative bg-bg-raised border border-border-default rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in">
				<div className="flex items-center justify-between mb-5">
					<h2 className="font-display text-xl">{title}</h2>
					<button
						type="button"
						onClick={onClose}
						className="text-text-tertiary hover:text-text-primary transition-colors p-1"
					>
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
				</div>
				{children}
			</div>
		</div>
	);
}

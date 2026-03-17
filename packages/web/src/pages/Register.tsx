import type { AxiosError } from "axios";
import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../store/auth";

export function RegisterPage() {
	const { register } = useAuth();
	const [mode, setMode] = useState<"create" | "join">("create");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [householdName, setHouseholdName] = useState("");
	const [inviteCode, setInviteCode] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			await register({
				name,
				email,
				password,
				...(mode === "create" ? { householdName } : { inviteCode }),
			});
		} catch (err) {
			const e = err as AxiosError<{ error?: string }>;
			setError(e.response?.data?.error || e.message || "Registration failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-bg-deep">
			{/* Ambient glow */}
			<div className="fixed top-[-40%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber-accent/[0.04] blur-[120px] pointer-events-none" />

			<div className="relative w-full max-w-[380px] animate-in">
				{/* Brand */}
				<div className="text-center mb-10">
					<div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-glow border border-amber-accent/20 mb-5">
						<svg
							width="26"
							height="26"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							className="text-amber-accent"
						>
							<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
							<polyline points="9 22 9 12 15 12 15 22" />
						</svg>
					</div>
					<h1 className="font-display text-[28px] leading-tight text-text-primary">
						Get Started
					</h1>
					<p className="text-sm text-text-tertiary mt-1.5">
						Create or join a household
					</p>
				</div>

				{/* Form card */}
				<div className="bg-bg-raised/80 backdrop-blur-sm border border-border-default rounded-2xl p-7 shadow-[0_8px_40px_rgba(0,0,0,0.3)]">
					{error && (
						<div className="mb-5 flex items-center gap-2.5 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3">
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								className="shrink-0"
							>
								<circle cx="12" cy="12" r="10" />
								<line x1="12" y1="8" x2="12" y2="12" />
								<line x1="12" y1="16" x2="12.01" y2="16" />
							</svg>
							{error}
						</div>
					)}

					{/* Mode toggle */}
					<div className="flex bg-bg-elevated rounded-xl p-1 gap-1 mb-6">
						<button
							type="button"
							onClick={() => setMode("create")}
							className={`flex-1 text-sm py-2 rounded-lg font-medium transition-all ${
								mode === "create"
									? "bg-amber-glow text-amber-accent shadow-sm"
									: "text-text-tertiary hover:text-text-secondary"
							}`}
						>
							New Household
						</button>
						<button
							type="button"
							onClick={() => setMode("join")}
							className={`flex-1 text-sm py-2 rounded-lg font-medium transition-all ${
								mode === "join"
									? "bg-amber-glow text-amber-accent shadow-sm"
									: "text-text-tertiary hover:text-text-secondary"
							}`}
						>
							Join Existing
						</button>
					</div>

					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label
								htmlFor="reg-name"
								className="block text-sm font-medium text-text-secondary mb-2"
							>
								Your Name
							</label>
							<input
								id="reg-name"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Full name"
								required
								className="w-full bg-bg-elevated border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-amber-dim focus:ring-1 focus:ring-amber-glow-strong transition-colors"
							/>
						</div>

						<div>
							<label
								htmlFor="reg-email"
								className="block text-sm font-medium text-text-secondary mb-2"
							>
								Email
							</label>
							<input
								id="reg-email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@example.com"
								required
								className="w-full bg-bg-elevated border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-amber-dim focus:ring-1 focus:ring-amber-glow-strong transition-colors"
							/>
						</div>

						<div>
							<label
								htmlFor="reg-password"
								className="block text-sm font-medium text-text-secondary mb-2"
							>
								Password
							</label>
							<input
								id="reg-password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Min 6 characters"
								minLength={6}
								required
								className="w-full bg-bg-elevated border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-amber-dim focus:ring-1 focus:ring-amber-glow-strong transition-colors"
							/>
						</div>

						{mode === "create" ? (
							<div>
								<label
									htmlFor="reg-household"
									className="block text-sm font-medium text-text-secondary mb-2"
								>
									Household Name
								</label>
								<input
									id="reg-household"
									type="text"
									value={householdName}
									onChange={(e) => setHouseholdName(e.target.value)}
									placeholder="e.g. The Smiths"
									required
									className="w-full bg-bg-elevated border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-amber-dim focus:ring-1 focus:ring-amber-glow-strong transition-colors"
								/>
							</div>
						) : (
							<div>
								<label
									htmlFor="reg-invite"
									className="block text-sm font-medium text-text-secondary mb-2"
								>
									Invite Code
								</label>
								<input
									id="reg-invite"
									type="text"
									value={inviteCode}
									onChange={(e) => setInviteCode(e.target.value)}
									placeholder="Paste household invite code"
									required
									className="w-full bg-bg-elevated border border-border-default rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-amber-dim focus:ring-1 focus:ring-amber-glow-strong transition-colors"
								/>
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-amber-accent text-text-inverse font-semibold py-3 rounded-xl text-sm hover:brightness-110 active:brightness-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_24px_rgba(232,168,73,0.2)]"
						>
							{loading
								? "Creating account..."
								: mode === "create"
									? "Create Household"
									: "Join Household"}
						</button>
					</form>
				</div>

				<p className="text-center text-sm text-text-tertiary mt-6">
					Already have an account?{" "}
					<Link
						to="/login"
						className="text-amber-accent font-medium hover:underline"
					>
						Sign in
					</Link>
				</p>
			</div>
		</div>
	);
}

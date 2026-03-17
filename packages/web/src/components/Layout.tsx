import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../store/auth";

const NAV_ITEMS = [
	{ to: "/", icon: "grid", label: "Dashboard" },
	{ to: "/tasks", icon: "check-square", label: "Tasks" },
	{ to: "/events", icon: "calendar", label: "Events" },
	{ to: "/shopping", icon: "shopping-bag", label: "Shopping" },
	{ to: "/expenses", icon: "receipt", label: "Expenses" },
	{ to: "/household", icon: "home", label: "Household" },
];

function NavIcon({ name }: { name: string }) {
	const icons: Record<string, React.ReactNode> = {
		grid: (
			<svg
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<rect x="3" y="3" width="7" height="7" rx="1" />
				<rect x="14" y="3" width="7" height="7" rx="1" />
				<rect x="3" y="14" width="7" height="7" rx="1" />
				<rect x="14" y="14" width="7" height="7" rx="1" />
			</svg>
		),
		"check-square": (
			<svg
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<polyline points="9 11 12 14 22 4" />
				<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
			</svg>
		),
		calendar: (
			<svg
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<rect x="3" y="4" width="18" height="18" rx="2" />
				<line x1="16" y1="2" x2="16" y2="6" />
				<line x1="8" y1="2" x2="8" y2="6" />
				<line x1="3" y1="10" x2="21" y2="10" />
			</svg>
		),
		"shopping-bag": (
			<svg
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
				<line x1="3" y1="6" x2="21" y2="6" />
				<path d="M16 10a4 4 0 0 1-8 0" />
			</svg>
		),
		receipt: (
			<svg
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2-3-2z" />
				<line x1="8" y1="10" x2="16" y2="10" />
				<line x1="8" y1="14" x2="13" y2="14" />
			</svg>
		),
		home: (
			<svg
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
				<polyline points="9 22 9 12 15 12 15 22" />
			</svg>
		),
	};
	return <>{icons[name]}</>;
}

export function Layout() {
	const { user, logout } = useAuth();

	return (
		<div className="flex h-screen overflow-hidden">
			{/* Sidebar */}
			<aside className="w-60 shrink-0 flex flex-col bg-bg-base border-r border-border-default">
				{/* Logo */}
				<div className="px-5 pt-6 pb-4">
					<h1 className="font-display text-xl text-amber-accent tracking-tight">
						House Tracker
					</h1>
					<p className="text-xs text-text-tertiary mt-0.5 font-light">
						Manage your home together
					</p>
				</div>

				{/* Navigation */}
				<nav className="flex-1 px-3 space-y-0.5">
					{NAV_ITEMS.map((item) => (
						<NavLink
							key={item.to}
							to={item.to}
							end={item.to === "/"}
							className={({ isActive }) =>
								`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
									isActive
										? "bg-amber-glow text-amber-accent"
										: "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
								}`
							}
						>
							<NavIcon name={item.icon} />
							{item.label}
						</NavLink>
					))}
				</nav>

				{/* User */}
				<div className="p-3 border-t border-border-default">
					<div className="flex items-center gap-3 px-2 py-2">
						<div
							className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-text-inverse shrink-0"
							style={{ backgroundColor: user?.avatarColor || "#6366f1" }}
						>
							{user?.name?.charAt(0).toUpperCase()}
						</div>
						<div className="flex-1 min-w-0">
							<div className="text-sm font-medium truncate">{user?.name}</div>
							<div className="text-xs text-text-tertiary truncate">
								{user?.role}
							</div>
						</div>
						<button
							type="button"
							onClick={logout}
							className="text-text-tertiary hover:text-danger transition-colors p-1"
							title="Sign out"
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
								<polyline points="16 17 21 12 16 7" />
								<line x1="21" y1="12" x2="9" y2="12" />
							</svg>
						</button>
					</div>
				</div>
			</aside>

			{/* Main content */}
			<main className="flex-1 overflow-y-auto bg-bg-deep">
				<div className="max-w-5xl mx-auto px-8 py-8">
					<Outlet />
				</div>
			</main>
		</div>
	);
}

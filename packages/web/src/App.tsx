import { Navigate, Route, Routes } from "react-router-dom";
import { Spinner } from "./components/Empty";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/Dashboard";
import { EventsPage } from "./pages/Events";
import { ExpensesPage } from "./pages/Expenses";
import { HouseholdPage } from "./pages/Household";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { ShoppingPage } from "./pages/Shopping";
import { TasksPage } from "./pages/Tasks";
import { useAuth } from "./store/auth";

export function App() {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-bg-deep">
				<Spinner />
			</div>
		);
	}

	if (!user) {
		return (
			<Routes>
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
				<Route path="*" element={<Navigate to="/login" replace />} />
			</Routes>
		);
	}

	return (
		<Routes>
			<Route element={<Layout />}>
				<Route path="/" element={<DashboardPage />} />
				<Route path="/tasks" element={<TasksPage />} />
				<Route path="/events" element={<EventsPage />} />
				<Route path="/shopping" element={<ShoppingPage />} />
				<Route path="/expenses" element={<ExpensesPage />} />
				<Route path="/household" element={<HouseholdPage />} />
			</Route>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

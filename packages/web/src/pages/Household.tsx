import { type FormEvent, useState } from "react";
import type { IHousehold, IUser } from "shared";
import { Avatar } from "../components/Badge";
import { Button } from "../components/Button";
import { Card, CardHeader } from "../components/Card";
import { Spinner } from "../components/Empty";
import { Input } from "../components/Input";
import { apiDelete, apiPatch, useApi } from "../hooks/useApi";
import { useAuth } from "../store/auth";

type PopulatedHousehold = Omit<IHousehold, "members"> & {
	members: IUser[];
};

export function HouseholdPage() {
	const { user } = useAuth();
	const {
		data: household,
		loading,
		refetch,
	} = useApi<PopulatedHousehold>("/household");
	const [editing, setEditing] = useState(false);
	const [newName, setNewName] = useState("");

	if (loading) return <Spinner />;
	if (!household) return null;

	const isAdmin = user?.role === "admin";

	const handleRename = async (e: FormEvent) => {
		e.preventDefault();
		await apiPatch("/household", { name: newName });
		setEditing(false);
		refetch();
	};

	const removeMember = async (memberId: string) => {
		await apiDelete(`/household/members/${memberId}`);
		refetch();
	};

	return (
		<div className="animate-in">
			<div className="mb-6">
				<h2 className="font-display text-2xl">Household</h2>
				<p className="text-sm text-text-secondary mt-0.5">
					Manage your home and members
				</p>
			</div>

			{/* Household info */}
			<Card className="mb-6">
				<div className="flex items-center justify-between">
					{editing ? (
						<form
							onSubmit={handleRename}
							className="flex items-center gap-2 flex-1"
						>
							<Input
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								placeholder="Household name"
								className="flex-1"
								required
							/>
							<Button type="submit">Save</Button>
							<Button
								type="button"
								variant="ghost"
								onClick={() => setEditing(false)}
							>
								Cancel
							</Button>
						</form>
					) : (
						<>
							<div>
								<h3 className="font-display text-xl">{household.name}</h3>
								<p className="text-xs text-text-tertiary mt-0.5">
									{household.members.length} members
								</p>
							</div>
							{isAdmin && (
								<Button
									variant="ghost"
									onClick={() => {
										setNewName(household.name);
										setEditing(true);
									}}
								>
									Rename
								</Button>
							)}
						</>
					)}
				</div>
			</Card>

			{/* Invite code */}
			<Card className="mb-6">
				<CardHeader title="Invite Code" />
				<p className="text-xs text-text-secondary mb-2">
					Share this code so others can join your household
				</p>
				<div className="flex items-center gap-2">
					<code className="flex-1 bg-bg-elevated border border-border-default rounded-lg px-3 py-2 text-sm font-mono text-amber-accent select-all">
						{household._id}
					</code>
					<Button
						variant="secondary"
						onClick={() => navigator.clipboard.writeText(household._id)}
					>
						Copy
					</Button>
				</div>
			</Card>

			{/* Members */}
			<Card>
				<CardHeader title="Members" />
				<div className="space-y-2">
					{household.members.map((member) => (
						<div
							key={member._id}
							className="flex items-center gap-3 p-3 rounded-lg bg-bg-elevated/50"
						>
							<Avatar name={member.name} color={member.avatarColor} size="md" />
							<div className="flex-1 min-w-0">
								<div className="text-sm font-medium">
									{member.name}
									{member._id === user?._id && (
										<span className="text-xs text-text-tertiary ml-1.5">
											(you)
										</span>
									)}
								</div>
								<div className="text-xs text-text-tertiary">
									{member.email} · {member.role}
								</div>
							</div>
							{isAdmin && member._id !== user?._id && (
								<Button
									variant="danger"
									onClick={() => removeMember(member._id)}
									className="text-xs !px-2 !py-1"
								>
									Remove
								</Button>
							)}
						</div>
					))}
				</div>
			</Card>
		</div>
	);
}

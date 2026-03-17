import { type FormEvent, useState } from "react";
import type { IShoppingList } from "shared";
import { Button } from "../components/Button";

import { Empty, Spinner } from "../components/Empty";
import { Input } from "../components/Input";
import { Modal } from "../components/Modal";
import { apiDelete, apiPost, useApi } from "../hooks/useApi";

export function ShoppingPage() {
	const {
		data: lists,
		loading,
		refetch,
	} = useApi<IShoppingList[]>("/shopping-lists");
	const [showNew, setShowNew] = useState(false);
	const [activeId, setActiveId] = useState<string | null>(null);

	if (loading) return <Spinner />;

	const activeList = activeId ? lists?.find((l) => l._id === activeId) : null;

	return (
		<div className="animate-in">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h2 className="font-display text-2xl">Shopping Lists</h2>
					<p className="text-sm text-text-secondary mt-0.5">
						{lists?.length ?? 0} lists
					</p>
				</div>
				<Button onClick={() => setShowNew(true)}>+ New List</Button>
			</div>

			{!lists?.length ? (
				<Empty
					icon={
						<svg
							width="40"
							height="40"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
						>
							<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
							<line x1="3" y1="6" x2="21" y2="6" />
							<path d="M16 10a4 4 0 0 1-8 0" />
						</svg>
					}
					title="No shopping lists"
					description="Create a list to start tracking items"
					action={<Button onClick={() => setShowNew(true)}>Create List</Button>}
				/>
			) : (
				<div className="grid grid-cols-3 gap-3">
					{lists.map((list) => (
						<button
							key={list._id}
							type="button"
							onClick={() => setActiveId(list._id)}
							className="text-left bg-bg-raised border border-border-default rounded-xl p-4 hover:border-border-strong transition-colors"
						>
							<div className="text-sm font-medium mb-1">{list.name}</div>
							<div className="text-xs text-text-tertiary">
								{list.items.length} items ·{" "}
								{list.items.filter((i) => i.checked).length} checked
							</div>
							{list.archived && (
								<span className="text-[10px] text-text-tertiary bg-bg-elevated px-1.5 py-0.5 rounded mt-2 inline-block">
									Archived
								</span>
							)}
						</button>
					))}
				</div>
			)}

			{/* New list modal */}
			<NewListModal
				open={showNew}
				onClose={() => setShowNew(false)}
				onCreated={(id) => {
					refetch();
					setActiveId(id);
				}}
			/>

			{/* List detail modal */}
			{activeList && (
				<ListDetailModal
					list={activeList}
					onClose={() => setActiveId(null)}
					onUpdate={refetch}
				/>
			)}
		</div>
	);
}

function NewListModal({
	open,
	onClose,
	onCreated,
}: {
	open: boolean;
	onClose: () => void;
	onCreated: (id: string) => void;
}) {
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			const list = await apiPost<IShoppingList>("/shopping-lists", { name });
			setName("");
			onCreated(list._id);
			onClose();
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal open={open} onClose={onClose} title="New List">
			<form onSubmit={handleSubmit} className="space-y-4">
				<Input
					label="List Name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="e.g. Weekly Groceries"
					required
				/>
				<div className="flex gap-3 pt-2">
					<Button
						type="button"
						variant="secondary"
						onClick={onClose}
						className="flex-1"
					>
						Cancel
					</Button>
					<Button type="submit" disabled={loading} className="flex-1">
						Create
					</Button>
				</div>
			</form>
		</Modal>
	);
}

function ListDetailModal({
	list,
	onClose,
	onUpdate,
}: {
	list: IShoppingList;
	onClose: () => void;
	onUpdate: () => void;
}) {
	const [newItem, setNewItem] = useState("");
	const [adding, setAdding] = useState(false);

	const addItem = async (e: FormEvent) => {
		e.preventDefault();
		if (!newItem.trim()) return;
		setAdding(true);
		try {
			await apiPost(`/shopping-lists/${list._id}/items`, {
				name: newItem.trim(),
			});
			setNewItem("");
			onUpdate();
		} finally {
			setAdding(false);
		}
	};

	const toggleItem = async (itemId: string) => {
		await apiPost(`/shopping-lists/${list._id}/items/${itemId}/toggle`, {});
		onUpdate();
	};

	const deleteList = async () => {
		await apiDelete(`/shopping-lists/${list._id}`);
		onUpdate();
		onClose();
	};

	const clearChecked = async () => {
		await apiDelete(`/shopping-lists/${list._id}/items/checked`);
		onUpdate();
	};

	const unchecked = list.items.filter((i) => !i.checked);
	const checked = list.items.filter((i) => i.checked);

	return (
		<Modal open onClose={onClose} title={list.name}>
			{/* Add item */}
			<form onSubmit={addItem} className="flex gap-2 mb-4">
				<Input
					value={newItem}
					onChange={(e) => setNewItem(e.target.value)}
					placeholder="Add item..."
					className="flex-1"
				/>
				<Button type="submit" disabled={adding}>
					Add
				</Button>
			</form>

			{/* Items */}
			<div className="space-y-1 max-h-64 overflow-y-auto">
				{unchecked.map((item) => (
					<ItemRow
						key={item.name + item.addedBy}
						item={item}
						onToggle={toggleItem}
					/>
				))}
				{checked.length > 0 && (
					<>
						<div className="flex items-center justify-between pt-3 pb-1">
							<span className="text-xs text-text-tertiary">
								Checked ({checked.length})
							</span>
							<button
								type="button"
								onClick={clearChecked}
								className="text-xs text-danger hover:underline"
							>
								Clear checked
							</button>
						</div>
						{checked.map((item) => (
							<ItemRow
								key={item.name + item.addedBy}
								item={item}
								onToggle={toggleItem}
							/>
						))}
					</>
				)}
			</div>

			{list.items.length === 0 && (
				<p className="text-sm text-text-tertiary text-center py-6">
					No items yet
				</p>
			)}

			<div className="mt-4 pt-4 border-t border-border-default">
				<Button variant="danger" onClick={deleteList} className="w-full">
					Delete List
				</Button>
			</div>
		</Modal>
	);
}

function ItemRow({
	item,
	onToggle,
}: {
	item: IShoppingList["items"][number];
	onToggle: (itemId: string) => void;
}) {
	const itemId = item._id;
	return (
		<button
			type="button"
			onClick={() => onToggle(itemId)}
			className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-bg-hover transition-colors text-left"
		>
			<div
				className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
					item.checked
						? "bg-success/20 border-success text-success"
						: "border-border-strong"
				}`}
			>
				{item.checked && (
					<svg
						width="10"
						height="10"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="3"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polyline points="20 6 9 17 4 12" />
					</svg>
				)}
			</div>
			<span
				className={`text-sm flex-1 ${item.checked ? "line-through text-text-tertiary" : ""}`}
			>
				{item.name}
			</span>
			{item.quantity > 1 && (
				<span className="text-xs text-text-tertiary">x{item.quantity}</span>
			)}
		</button>
	);
}

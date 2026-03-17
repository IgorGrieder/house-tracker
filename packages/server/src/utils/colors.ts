const AVATAR_COLORS = [
	"#6366f1",
	"#ec4899",
	"#f59e0b",
	"#10b981",
	"#3b82f6",
	"#8b5cf6",
	"#ef4444",
	"#14b8a6",
];

let colorIndex = 0;

export function nextAvatarColor(): string {
	const color = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
	colorIndex++;
	return color;
}

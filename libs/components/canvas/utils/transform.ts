export function getTransformStyle(
	scale: number,
	x: number,
	y: number,
): React.CSSProperties {
	return {
		transform: `translate(${x}px, ${y}px) scale(${scale})`,
		transformOrigin: "0 0",
		transition: "transform 0.1s ease",
	};
}

export function getEntityStyle(
	x: number,
	y: number,
	width: number | null,
	height: number | null,
	isSelected: boolean,
): React.CSSProperties {
	return {
		position: "absolute",
		left: `${x}px`,
		top: `${y}px`,
		width: width ? `${width}px` : "auto",
		height: height ? `${height}px` : "auto",
		border: isSelected ? "2px solid #3b82f6" : "1px solid #e5e7eb",
		borderRadius: "4px",
		backgroundColor: "#ffffff",
		boxShadow: isSelected
			? "0 0 0 2px rgba(59, 130, 246, 0.5)"
			: "0 1px 3px rgba(0, 0, 0, 0.1)",
		cursor: "move",
		userSelect: "none",
		overflow: "hidden",
	};
}

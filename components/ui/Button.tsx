type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: "primary" | "secondary" | "danger";
	size?: "small" | "medium" | "large";
	isLoading?: boolean;
};

export const Button = ({
	variant = "primary",
	size = "medium",
	isLoading = false,
	...props
}: ButtonProps) => {
	return (
		<button
			className={`btn ${variant ? `btn-${variant}` : ''} ${size ? `btn-${size}` : ''}`}
			{...props}
		>
			{isLoading ? "Loading..." : props.children}
		</button>
	);
};
import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
	primary:
		"bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700",
	secondary:
		"border border-border bg-transparent text-foreground hover:bg-neutral-100 active:bg-neutral-200",
	ghost:
		"bg-transparent text-foreground hover:bg-neutral-100 active:bg-neutral-200",
	danger:
		"bg-danger text-white hover:bg-red-700 active:bg-red-800",
};

const sizeClasses: Record<ButtonSize, string> = {
	sm: "text-sm px-3 py-1.5",
	md: "text-sm px-4 py-2",
	lg: "text-base px-6 py-3",
};

const Spinner = () => (
	<svg
		className='animate-spin -ml-1 mr-2 h-4 w-4'
		xmlns='http://www.w3.org/2000/svg'
		fill='none'
		viewBox='0 0 24 24'
	>
		<circle
			className='opacity-25'
			cx='12'
			cy='12'
			r='10'
			stroke='currentColor'
			strokeWidth='4'
		/>
		<path
			className='opacity-75'
			fill='currentColor'
			d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
		/>
	</svg>
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			variant = "primary",
			size = "md",
			loading = false,
			disabled,
			className,
			children,
			...props
		},
		ref
	) => {
		const isDisabled = disabled || loading;

		const classes = `inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${variantClasses[variant]} ${sizeClasses[size]} ${isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""} ${className ?? ""}`.trim();

		return (
			<button
				ref={ref}
				disabled={isDisabled}
				className={classes}
				{...props}
			>
				{loading && <Spinner />}
				{children}
			</button>
		);
	}
);

Button.displayName = "Button";

export default Button;

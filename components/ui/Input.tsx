type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
	label?: string;
	error?: string;
};

export const Input = ({ label, error, ...props }: InputProps) => {
	return (
		<div className="flex flex-col gap-1">
			{label && (
				<label htmlFor={props.id} className="text-sm font-medium text-gray-700">
					{label}
				</label>
			)}
			<input
				className={`w-full px-3 py-2 border rounded ${
					error ? 'border-red-500' : 'border-gray-300'
				}`}
				{...props}
			/>
			{error && <p className="text-red-500 text-sm mt-1">{error}</p>}
		</div>
	);
};
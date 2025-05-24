import React from 'react'
import clsx from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	children: React.ReactNode
	className?: string
}

export const Button: React.FC<ButtonProps> = ({
	children,
	className,
	...props
}) => {
	return (
		<button
			{...props}
			className={clsx(
				'bg-white w-fit text-black text-xs px-3 py-1.5 rounded-md font-medium transition-colors',
				'hover:cursor-pointer',
				className
			)}
		>
			{children}
		</button>
	)
}

import React from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface CardProps {
	children: React.ReactNode
	className?: string
}

export const HoverCard: React.FC<CardProps> = ({ children, className }) => {
	return (
		<motion.div
			initial={{ borderColor: '#1c1c1c' }}
			whileHover={{ borderColor: '#2c2c2c' }}
			transition={{ duration: 0.3 }}
			className={clsx(
				'bg-[#0a0a0a] p-2 border rounded-2xl transition-colors z-10',
				'border-[#1c1c1c] border-1',
				className
			)}
		>
			{children}
		</motion.div>
	)
}

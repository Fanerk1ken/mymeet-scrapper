'use client'

import { motion } from 'motion/react'

export function ShiningText() {
	return (
		<motion.h1
			className='bg-[linear-gradient(110deg,#202020,35%,#fff,50%,#202020,75%,#202020)] bg-[length:200%_100%] bg-clip-text text-xs font-medium text-transparent'
			initial={{ backgroundPosition: '200% 0' }}
			animate={{ backgroundPosition: '-200% 0' }}
			transition={{
				repeat: Infinity,
				duration: 2,
				ease: 'linear',
			}}
		>
			Собираю...
		</motion.h1>
	)
}

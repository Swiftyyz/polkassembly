// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState, useEffect } from 'react';

function FeaturesSection() {
	const [currentIndex, setCurrentIndex] = useState(0);

	const features = [
		{
			description: 'Delegate your vote and catchup with Delegation Dashboard',
			image: '/assets/features1.svg',
			title: 'Delegation Dashboard'
		},
		{
			description: 'Vote on top proposals in a single transaction',
			image: '/assets/features2.svg',
			title: 'Batch Voting'
		},
		{
			description: 'Create, Manage and Participate in Bounties',
			image: '/assets/features3.svg',
			title: 'Bounties'
		},
		{
			description: 'Set identity with Polkassembly at 1/4th of the cost',
			image: '/assets/features4.svg',
			title: 'Identity'
		}
	];

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentIndex((prevIndex) => (prevIndex + 1) % features.length);
		}, 5000);

		return () => clearInterval(interval);
	}, [features.length]);

	const handleDotClick = (index: number) => {
		setCurrentIndex(index);
	};

	return (
		<div className='mt-5 rounded-xxl bg-white p-5 font-poppins text-[13px] drop-shadow-md dark:bg-section-dark-overlay md:p-5'>
			<div className='flex items-start justify-between gap-2'>
				<div className='flex items-start gap-1'>
					<p className='text-lg font-semibold'>Features</p>
					<p className='mt-1 rounded-full bg-[#E5007A] p-1 text-[10px] font-bold text-white'>LIVE</p>
				</div>
				<div className='flex gap-2'>
					{features.map((_, index) => (
						<div
							key={index}
							className={`mt-2 h-2 w-2 cursor-pointer rounded-full ${index === currentIndex ? 'bg-black  dark:bg-[#9E9E9E]' : 'bg-[#D9D9D9] '}`}
							onClick={() => handleDotClick(index)}
						/>
					))}
				</div>
			</div>
			<div>
				<img
					src={features[currentIndex].image}
					className='h-full w-full'
					alt={features[currentIndex].title}
				/>
				<div className='mt-2'>
					<p className='m-0 text-lg font-semibold'>{features[currentIndex].title}</p>
					<p className='text-[14px]'>{features[currentIndex].description}</p>
				</div>
			</div>
		</div>
	);
}

export default FeaturesSection;

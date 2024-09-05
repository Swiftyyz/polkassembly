// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import SwipableVotingCards from './SwipableVotingCards';
import dynamic from 'next/dynamic';
import { Skeleton } from 'antd';
const BatchCart = dynamic(() => import('./BatchCart'), {
	loading: () => <Skeleton active />,
	ssr: false
});

const VotingOptions = () => {
	return (
		<section className='mb-[200px] flex w-full gap-x-4'>
			<article className='h-[557px] w-[70%] items-center justify-start gap-x-3 rounded-xl bg-white dark:bg-black'>
				<div className='h-[557px] w-full bg-transparent p-5 drop-shadow-lg'>
					<SwipableVotingCards />
				</div>
			</article>

			{/* add confirm batch vote CTA inside voteCard component and fix max-h-[662px] to 557px */}
			<article className='h-[557px] w-[30%] items-center justify-start gap-x-3 rounded-xl bg-white py-2 dark:bg-black'>
				<BatchCart />
			</article>
		</section>
	);
};

export default VotingOptions;

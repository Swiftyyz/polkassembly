// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import { Collapse } from 'antd';
import ImageIcon from '~src/ui-components/ImageIcon';
import { ArrowDownIcon } from '~src/ui-components/CustomIcons';
import { IScoringSection } from './types';
import Image from 'next/image';
import { useTheme } from 'next-themes';

const { Panel } = Collapse;

const scoringData: IScoringSection[] = [
	{
		icon: '/assets/astral-scoring-page/discussion-icon.svg',
		items: [
			{ label: 'Like/Dislike', points: 20, type: 'off-chain' },
			{ label: 'Post a comment or Reply to one', points: 5, type: 'off-chain' },
			{ label: 'Link Discussion to Proposal', points: 20, type: 'on-chain' },
			{ label: 'Create Discussion', points: 5, type: 'off-chain' },
			{ label: 'Received a like on your discussions', points: 10, type: 'off-chain' },
			{ label: 'Received a like on your comment / reply', points: 25, type: 'on-chain' }
		],
		title: 'Discussions'
	},
	{
		icon: '/assets/astral-scoring-page/bounty-icon.svg',
		items: [
			{ label: 'Create Bounty', points: 20, type: 'on-chain' },
			{ label: 'Approve Bounty', points: 5, type: 'on-chain' },
			{ label: 'Create Child Bounty', points: 10, type: 'on-chain' },
			{ label: 'Claim Bounty', points: 16, type: 'on-chain' }
		],
		title: 'Bounties'
	},
	{
		icon: '/assets/astral-scoring-page/verfiy-id.svg',
		items: [
			{ label: 'Verify identity- Sign up for verification of on chain identity', points: 20 },
			{ label: 'Verify identity- Request and complete judgement', points: 5 }
		],
		title: 'Verify Identity'
	},
	{
		icon: '/assets/astral-scoring-page/delegation.svg',
		items: [
			{ label: 'Sent DelegationUser delegates their vote to another user (irrespective of # of tracks - one time)', points: 10 },
			{ label: 'Received Delegation- User receives delegation from another user', points: 16 }
		],
		title: 'Delegation'
	}
];

const ScoringDetails = () => {
	const { resolvedTheme: theme } = useTheme();

	return (
		<article className='flex flex-col gap-y-6'>
			{scoringData.map((section, index) => (
				<Collapse
					key={index}
					size='middle'
					className='bg-white dark:border-separatorDark dark:bg-section-dark-overlay'
					expandIconPosition='end'
					expandIcon={({ isActive }) => <ArrowDownIcon className={`dark:text-blue-dark-medium ${isActive ? 'rotate-180' : ''}`} />}
					defaultActiveKey={[1]}
				>
					<Panel
						header={
							<div className='channel-header flex items-center gap-[6px]'>
								<ImageIcon
									src={section.icon}
									alt={`${section.title.toLowerCase()}-icon`}
								/>
								<h3 className='m-0 p-0 text-base font-semibold leading-[16px] tracking-wide text-sidebarBlue dark:text-blue-dark-high md:text-[18px]'>{section.title}</h3>
							</div>
						}
						key='1'
						className='border-b dark:border-[#3b444f]'
					>
						{section.items ? (
							<article className='flex flex-col gap-y-2'>
								{section.items.map((item, idx) => (
									<div
										key={idx}
										className='flex items-center justify-between rounded-lg bg-[#F7F7F7] px-3 py-2 dark:bg-highlightBg'
									>
										<div className='flex items-center gap-x-2'>
											<p className='m-0 w-[200px] p-0 text-[12px] font-normal text-bodyBlue dark:text-white md:w-auto md:text-sm'>{item.label}</p>
											{item?.type && (
												<span className='m-0 flex h-5 items-center gap-x-1 whitespace-nowrap rounded bg-white p-0 px-2 text-[10px] text-sidebarBlue dark:bg-black  dark:text-blue-dark-medium'>
													<Image
														src={`/assets/astral-scoring-page/${item.type}-icon.svg`}
														alt={`${item?.type}-icon`}
														height={20}
														width={20}
														className={theme == 'dark' ? 'dark-icons' : ''}
													/>
													{item.type.charAt(0).toUpperCase() + item.type.slice(1).replace('-', ' ')}
												</span>
											)}
										</div>
										<div className='flex items-center gap-x-0.5'>
											<p className='m-0 p-0 text-base font-semibold text-[#FFBA03]'>{item.points}</p>
											<ImageIcon
												src='/assets/icons/astral-star-icon.svg'
												alt='astral-star-icon'
												imgClassName='scale-[75%]'
											/>
										</div>
									</div>
								))}
							</article>
						) : null}
					</Panel>
				</Collapse>
			))}
		</article>
	);
};

export default ScoringDetails;

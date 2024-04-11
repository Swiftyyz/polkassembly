// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import { Collapse } from '~src/components/Settings/Notifications/common-ui/Collapse';
import { useTheme } from 'next-themes';
import { IAnalyticsVoteTrends } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import ImageIcon from '~src/ui-components/ImageIcon';
import { StatTabs } from '~src/components/Post/Tabs/PostStats/Tabs/StatTabs';
import AnalyticsConvictionVotes from './AnalyticsConvictionVotes';
import AnalyticsVoteAmountVotes from './AnalyticsVoteAmountVotes';
import AnalyticsAccountsVotes from './AnalyticsAccountsVotes';
import Skeleton from '~src/basic-components/Skeleton';

const { Panel } = Collapse;

interface IProps {
	trackNumber: number;
}

interface ITabItem {
	key: string;
	label: string;
	children: React.ReactNode;
}

const AnalyticsVotingTrends = ({ trackNumber }: IProps) => {
	const { resolvedTheme: theme } = useTheme();
	const [activeTab, setActiveTab] = useState<string>('conviction-votes');
	const [voteData, setVoteData] = useState<IAnalyticsVoteTrends[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	console.log('trackNumber', trackNumber);

	const getVoteData = async () => {
		try {
			setIsLoading(true);
			const { data } = await nextApiClientFetch<{ votes: IAnalyticsVoteTrends[] }>('/api/v1/track_level_anaytics/votes-analytics', {
				trackNumber
			});

			console.log('data', data);
			if (data && data?.votes) {
				setVoteData(data?.votes);
				setIsLoading(false);
			}
		} catch (error) {
			console.error(error);
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (!isNaN(trackNumber)) {
			getVoteData();
			console.log('fetchinggg');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [trackNumber]);

	const tabItems: ITabItem[] = [
		{
			children: <AnalyticsConvictionVotes convictionVotes={voteData.map((vote: any) => vote.convictionVotes)} />,
			key: 'conviction-votes',
			label: 'Conviction Votes'
		},
		{
			children: <AnalyticsVoteAmountVotes voteAmount={voteData.map((vote: any) => vote.voteAmount)} />,
			key: 'vote-amount',
			label: 'Vote Amount'
		},
		{
			children: <AnalyticsAccountsVotes accounts={voteData.map((vote: any) => vote.accounts)} />,
			key: 'accounts',
			label: 'Accounts'
		}
	];

	return (
		<Collapse
			size='large'
			theme={theme as any}
			className='bg-white dark:border-separatorDark dark:bg-section-dark-overlay'
			expandIconPosition='end'
			expandIcon={({ isActive }) => (isActive ? <ExpandIcon /> : <CollapseIcon />)}
		>
			<Panel
				header={
					<div className='flex items-center gap-2'>
						<ImageIcon
							src='/assets/icons/voting-trends.svg'
							alt='Voting Trends icon'
						/>
						<span className='text-base font-semibold dark:text-blue-dark-high'>Voting Trends</span>
					</div>
				}
				key='1'
			>
				{' '}
				{isLoading ? (
					<Skeleton />
				) : (
					<>
						<StatTabs
							items={tabItems}
							setActiveTab={setActiveTab}
							activeTab={activeTab}
						/>
						{tabItems.find((item) => item.key === activeTab)?.children}
					</>
				)}
			</Panel>
		</Collapse>
	);
};

export default AnalyticsVotingTrends;

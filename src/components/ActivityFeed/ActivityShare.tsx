// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { trackEvent } from 'analytics';
import React, { FC, useEffect, useState } from 'react';
import { ProposalType } from '~src/global/proposalType';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { NetworkSocials } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useTheme } from 'next-themes';
import ImageIcon from '~src/ui-components/ImageIcon';

interface IShareButtonProps {
	postId: number | string;
	proposalType: ProposalType;
	title?: string;
}
const ActivityShare: FC<IShareButtonProps> = (props) => {
	const { postId, proposalType, title } = props;
	const { network } = useNetworkSelector();
	const currentUser = useUserDetailsSelector();
	const { resolvedTheme: theme } = useTheme();
	const [socialsData, setSocialsData] = useState<NetworkSocials>({
		block_explorer: '',
		description: '',
		discord: '',
		github: '',
		homepage: '',
		reddit: '',
		telegram: '',
		twitter: '',
		youtube: ''
	});

	const getSocials = async () => {
		const { data, error } = await nextApiClientFetch<NetworkSocials>('/api/v1/network-socials', {
			network
		});
		if (data) {
			setSocialsData(data);
		}
		if (error) console.log(error);
	};

	useEffect(() => {
		getSocials();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	const share = () => {
		// GAEvent for post sharing
		trackEvent('post_share_clicked', 'share_post', {
			postId: postId,
			postTitle: title,
			proposalType: proposalType,
			userId: currentUser?.id || '',
			userName: currentUser?.username || ''
		});
		const twitterHandle = socialsData?.twitter.substring(socialsData.twitter.lastIndexOf('/') + 1);

		let message = `The referendum ${title ? `for ${title}` : ''} is now live for @${twitterHandle} \n`;
		message += `Cast your vote here: ${global.window.location.href}`;

		const twitterParameters = [`text=${encodeURI(message)}`, 'via=' + encodeURI('polk_gov')];

		const url = 'https://twitter.com/intent/tweet?' + twitterParameters.join('&');
		global.window.open(url);
	};

	return (
		<>
			<div
				onClick={share}
				className='m-0 border-none bg-transparent font-normal shadow-none hover:cursor-pointer disabled:opacity-[0.5] dark:text-blue-dark-helper '
			>
				<span className='flex items-center gap-[6px]'>
					<ImageIcon
						src={`${theme === 'dark' ? '/assets/activityfeed/sharedark.svg' : '/assets/icons/share-pink.svg'}`}
						alt='share icon'
						className='h-5 w-5'
					/>
					<span className='dark:[#FF4098] hidden pt-1 font-medium text-[#E5007A] md:block'>Share</span>
				</span>
			</div>
		</>
	);
};

export default ActivityShare;

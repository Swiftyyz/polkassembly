// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider, message } from 'antd';

import React, { FC, useEffect, useState } from 'react';
import ImageComponent from '~src/components/ImageComponent';
import CopyIcon from '~assets/icons/content_copy_small.svg';
import WhiteCopyIcon from '~assets/icons/content_copy_small_white.svg';
import copyToClipboard from '~src/util/copyToClipboard';
import EvalutionSummary from '../../PostSummary/EvalutionSummary';
import MessageIcon from '~assets/icons/ChatIcon.svg';
import ClipBoardIcon from '~assets/icons/ClipboardText.svg';
import CalenderIcon from '~assets/icons/Calendar.svg';
import dayjs from 'dayjs';
import { useTheme } from 'next-themes';
import Address from '~src/ui-components/Address';
import userProfileBalances from '~src/util/userProfieBalances';
import { useApiContext } from '~src/context';
import { useNetworkSelector } from '~src/redux/selectors';
import BN from 'bn.js';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';

const ZERO_BN = new BN(0);
interface IProposerData {
	className?: string;
	address?: any;
	profileData?: any;
	isGood?: any;
}

const ProposerData: FC<IProposerData> = (props) => {
	const { className, address, profileData } = props;
	const [transferableBalance, setTransferableBalance] = useState<BN>(ZERO_BN);

	const [messageApi, contextHolder] = message.useMessage();
	const { resolvedTheme: theme } = useTheme();
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkSelector();
	const unit = chainProperties[network]?.tokenSymbol;

	useEffect(() => {
		if (!api || !apiReady) return;
		(async () => {
			const balances = await userProfileBalances({ address, api, apiReady, network });
			setTransferableBalance(balances?.transferableBalance || ZERO_BN);
			console.log(balances, transferableBalance);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	const success = () => {
		messageApi.open({
			content: 'Address copied to clipboard',
			duration: 10,
			type: 'success'
		});
	};

	console.log(profileData);

	return (
		<div className={`${className}`}>
			<div className='flex gap-x-4'>
				<div className='h-[60px] w-[60px]'>
					<ImageComponent
						src={profileData?.profile?.image}
						alt='User Picture'
						className='flex h-[60px] w-[60px] items-center justify-center bg-transparent'
						iconClassName='flex items-center justify-center text-[#FCE5F2] text-xxl w-full h-full rounded-full'
					/>
				</div>
				<div>
					<div className='flex gap-x-1'>
						<Address
							address={address}
							disableIdenticon={true}
							isUsedInDisplayData={true}
						/>
						<span
							className='-ml-2 -mt-0.5 flex cursor-pointer items-center'
							onClick={(e) => {
								e.preventDefault();
								copyToClipboard(address);
								success();
							}}
						>
							{contextHolder}
							{theme === 'dark' ? <WhiteCopyIcon className='ml-2 scale-125' /> : <CopyIcon className='ml-2 scale-125' />}
						</span>
					</div>
					{!profileData?.profile?.bio && (
						<div className='mt-5'>
							<p className='text-sm text-textGreyColor dark:text-lightGreyTextColor'>
								Lorem ipsum dolor, sit amet consectetur adipisicing elit. Reiciendis, voluptatibus, eum enim sunt et alias repudiandae repellat molestias quis odit, quia illo quod
								molestiae accusantium fuga hic commodi esse. Consequuntur quas reiciendis pariatur officia rerum, perspiciatis temporibus quae necessitatibus sed atque debitis
								minus enim unde nam modi qui deleniti quibusdam exercitationem illo et magnam at iure? Accusamus nesciunt sint mollitia.
							</p>
							<p className='text-sm text-textGreyColor'>{profileData?.profile?.bio}</p>
						</div>
					)}
					<div>
						<EvalutionSummary isUsedInEvaluationTab={true} />
					</div>
				</div>
			</div>
			<Divider
				style={{ background: '#D2D8E0', flexGrow: 1 }}
				className='mb-0 mt-2 dark:bg-separatorDark'
			/>
			<div className='mt-2 flex h-[60px] items-center divide-x  divide-gray-300'>
				<div className='flex w-1/4 gap-x-2 p-4'>
					<CalenderIcon />
					<div className='-mt-1'>
						<p className='m-0 p-0 text-[10px] text-lightBlue opacity-70 dark:text-lightGreyTextColor'>Account Since</p>
						<span className='m-0 p-0 text-sm font-semibold text-bodyBlue dark:text-white'>{dayjs(profileData?.created_at as string).format('DD MMM YYYY')}</span>
					</div>
				</div>
				<Divider
					type='vertical'
					className='h-[40px]'
				/>
				<div className='flex w-1/4 gap-x-2 p-4'>
					<ClipBoardIcon />
					<div className='-mt-1'>
						<p className='m-0 p-0 text-[10px] text-lightBlue opacity-70 dark:text-lightGreyTextColor'>Proposals</p>
						<span className='m-0 p-0 text-sm font-semibold text-bodyBlue dark:text-white'>{dayjs(profileData?.created_at as string).format('DD MMM YYYY')}</span>
					</div>
				</div>
				<Divider
					type='vertical'
					className='h-[40px]'
				/>
				<div className='flex w-1/4 gap-x-2 p-4'>
					<MessageIcon />
					<div className='-mt-1'>
						<p className='m-0 p-0 text-[10px] text-lightBlue opacity-70 dark:text-lightGreyTextColor'>Discussions</p>
						<span className='m-0 p-0 text-sm font-semibold text-bodyBlue dark:text-white'>{dayjs(profileData?.created_at as string).format('DD MMM YYYY')}</span>
					</div>
				</div>
				<Divider
					type='vertical'
					className='h-[40px]'
				/>
				<div className='flex w-1/4 gap-x-2 p-4'>
					<MessageIcon />
					<div className='-mt-1'>
						<p className='m-0 p-0 text-[10px] text-lightBlue opacity-70 dark:text-lightGreyTextColor'>Voting Power</p>
						<span className='m-0 p-0 text-sm font-semibold text-bodyBlue dark:text-white'>
							{formatedBalance((transferableBalance.toString() || '0').toString(), unit, 2)} {unit}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProposerData;

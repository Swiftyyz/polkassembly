// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import { Card, List } from 'antd';
import Identicon from '@polkadot/react-identicon';
import EthIdenticon from '~src/ui-components/EthIdenticon';
import shortenAddress from '~src/util/shortenAddress';
import { IDelegateAddressDetails } from '~src/types';
import Image from 'next/image';

interface DelegateCardProps {
	delegate: IDelegateAddressDetails;
	onStartChat: (address: string) => void;
}

const DelegateCard = ({ delegate, onStartChat }: DelegateCardProps) => (
	<List.Item
		onClick={() => onStartChat(delegate?.address)}
		className='cursor-pointer border-section-light-container p-0'
	>
		<Card
			className='w-full rounded-none border-x-0 border-b-0 text-bodyBlue hover:bg-black/5 dark:bg-section-dark-overlay dark:text-blue-dark-high dark:hover:bg-white/10'
			bodyStyle={{ alignItems: 'center', display: 'flex', gap: '0.5rem', width: '100%' }}
			size='small'
		>
			{delegate?.address?.startsWith('0x') ? (
				<EthIdenticon
					size={32}
					address={delegate?.address || ''}
				/>
			) : (
				<Identicon
					value={delegate?.address || ''}
					size={32}
					theme={'polkadot'}
				/>
			)}
			<span className='text-sm font-semibold text-bodyBlue dark:text-blue-dark-high'>{delegate?.username ? delegate?.username : shortenAddress(delegate?.address, 5)}</span>

			{delegate?.dataSource?.includes('nova') ? (
				<div className='ml-5 flex h-7 w-7 items-center justify-center rounded-md bg-[#E2EAFB] p-1.5'>
					<Image
						src='/assets/wallet/nova-wallet-star.svg'
						height={24}
						width={24}
						alt='nova wallet icon'
					/>
				</div>
			) : null}
		</Card>
	</List.Item>
);

export default DelegateCard;

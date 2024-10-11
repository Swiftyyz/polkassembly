// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import { MenuProps } from 'antd';
import { FC, useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import ReferendaLoginPrompts from '~src/ui-components/ReferendaLoginPrompts';
import CreateDiscussionIcon from '~assets/icons/create-icon.svg';
import CreateDiscussionIconDark from '~assets/icons/create-icon-dark.svg';
import dynamic from 'next/dynamic';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { network as AllNetworks } from '~src/global/networkConstants';
import SkeletonButton from '~src/basic-components/Skeleton/SkeletonButton';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import ProposalActionButtons from '~src/ui-components/ProposalActionButtons';
import { Dropdown } from '~src/ui-components/Dropdown';
import CreateProposalDropdownButton from '~src/ui-components/CreateProposalDropdownButton';

const OpenGovTreasuryProposal = dynamic(() => import('../OpenGovTreasuryProposal'), {
	loading: () => (
		<SkeletonButton
			className='w-full'
			active
		/>
	),
	ssr: false
});

const Gov1TreasuryProposal = dynamic(() => import('../Gov1TreasuryProposal'), {
	loading: () => (
		<SkeletonButton
			className='w-full'
			active
		/>
	),
	ssr: false
});

export const treasuryProposalCreationAllowedNetwork = [AllNetworks.KUSAMA, AllNetworks.POLKADOT, AllNetworks.ROCOCO];

interface IAiChatbotProps {
	className?: string;
}

const CreateProposalDropdown: FC<IAiChatbotProps> = () => {
	const router = useRouter();
	const { id } = useUserDetailsSelector();
	const [openDiscussionLoginPrompt, setOpenDiscussionLoginPrompt] = useState<boolean>(false);
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();

	const items: MenuProps['items'] = [
		{
			label: (
				<OpenGovTreasuryProposal
					theme={theme}
					isUsedInSidebar={true}
				/>
			),
			key: '0'
		},
		{
			label: <ProposalActionButtons isUsedInFAB={true} />,
			key: '1'
		},
		{
			label: (
				<div
					className='flex cursor-pointer gap-2'
					onClick={() => (id ? router.push('/post/create') : setOpenDiscussionLoginPrompt(true))}
				>
					{theme === 'dark' ? <CreateDiscussionIconDark /> : <CreateDiscussionIcon />}
					<span className='text-sm font-normal text-blue-light-medium dark:text-blue-dark-medium'>Discussion Post</span>
				</div>
			),
			key: '2'
		}
	];

	if (!isOpenGovSupported(network) && ![AllNetworks.POLYMESH, AllNetworks.COLLECTIVES, AllNetworks.WESTENDCOLLECTIVES].includes(network)) {
		items.unshift({
			label: <Gov1TreasuryProposal />,
			key: '3'
		});
	}

	return (
		<div>
			<Dropdown
				theme={theme}
				overlayStyle={{ marginTop: '40px', marginLeft: '10px', marginRight: '10px' }}
				className={'mt-2 flex cursor-pointer items-center justify-center bg-[#ffffff] dark:bg-section-dark-overlay'}
				overlayClassName='z-[1056]'
				placement='bottomRight'
				menu={{ items }}
			>
				<span className='mt-3'>
					<CreateProposalDropdownButton />
				</span>
			</Dropdown>

			<ReferendaLoginPrompts
				modalOpen={openDiscussionLoginPrompt}
				setModalOpen={setOpenDiscussionLoginPrompt}
				image='/assets/Gifs/login-discussion.gif'
				title='Join Polkassembly to Start a New Discussion.'
				subtitle='Discuss, contribute and get regular updates from Polkassembly.'
			/>
		</div>
	);
};

export default styled(CreateProposalDropdown)`
	.ant-dropdown-menu {
		background: #fff;
		border-radius: 8px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		padding: 10px 0;
	}

	.ant-dropdown-menu-item {
		padding: 10px 20px;
		font-size: 14px;
		&:hover {
			background: #f0f0f0;
		}
	}

	.ant-btn-primary {
		background: #e5007a;
		border-color: #e5007a;
		&:hover {
			background: #ba0566;
			border-color: #ba0566;
		}
	}
`;

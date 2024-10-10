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
import CreatePencilIcon from '~assets/icons/create-pencil-icon.svg';
import { poppins } from 'pages/_app';
import ProposalActionButtons from '~src/ui-components/ProposalActionButtons';
import { Dropdown } from '~src/ui-components/Dropdown';

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

const StyledButtonContainer = styled.div<{ gradient: string; shadow: string }>`
	padding: 1px;
	border-radius: 0.465rem;
	background: ${({ gradient }) => gradient};
	background-size: 200% 200%;
	display: inline-block;
	box-shadow: ${({ shadow }) => shadow};
	cursor: pointer;
	margin-left: 16px;
	margin-right: 16px;
	margin-top: 14px;
	margin-bottom: 6px;
	animation: gradientMove 1.5s linear infinite;

	@keyframes gradientMove {
		0% {
			background-position: top;
		}
		50% {
			background-position: bottom;
		}
		100% {
			background-position: top;
		}
	}

	.create-button {
		display: block;
		width: 100%;
		padding: 4px 16px;
		border-radius: 0.45rem;
		font-weight: 500;
		border: none;
		box-shadow: inset 1px 1px 2px 0 ${(props: any) => (props.theme === 'dark' ? '#2A2D2F' : '#DBE8F9')};
		background: ${(props: any) => (props.theme === 'dark' ? '#1A1A1A' : '#FFFFFF')};
	}

	.gradient-text {
		background: linear-gradient(180deg, #acceff, #00429b, #001b54);
		background-size: 200% 200%;
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		color: transparent;
		display: inline-block;
		animation: gradientMove 3s ease-in-out infinite;
	}
`;

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

	const gradient = theme === 'light' ? 'linear-gradient(#ACCEFF, #00429B)' : 'linear-gradient(#4FFAFF, #0437A7)';
	const shadow = theme === 'light' ? '2px 2px 1.8px -1px #D7DDE3' : '2px 2px 1.8px -1px #2066C7';

	return (
		<>
			<Dropdown
				theme={theme}
				overlayStyle={{ marginTop: '20px' }}
				className={'flex cursor-pointer items-center justify-center bg-white dark:bg-section-dark-overlay'}
				overlayClassName='z-[1056]'
				placement='bottomRight'
				menu={{ items }}
			>
				<StyledButtonContainer
					gradient={gradient}
					shadow={shadow}
				>
					<button className='create-button bg-white dark:bg-section-dark-overlay'>
						<div className='flex items-center justify-center gap-[6px]'>
							<CreatePencilIcon />
							<span className={`${poppins.variable} ${poppins.className} gradient-text`}>Create</span>
						</div>
					</button>
				</StyledButtonContainer>
			</Dropdown>

			<ReferendaLoginPrompts
				modalOpen={openDiscussionLoginPrompt}
				setModalOpen={setOpenDiscussionLoginPrompt}
				image='/assets/Gifs/login-discussion.gif'
				title='Join Polkassembly to Start a New Discussion.'
				subtitle='Discuss, contribute and get regular updates from Polkassembly.'
			/>
		</>
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

// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Drawer, Button } from 'antd';
import { poppins } from 'pages/_app';
import { useState } from 'react';
import Image from 'next/image';
import UserChats from './UserChats';
import ChatHeader from './ChatHeader';

interface Props {
	className?: string;
}

interface IChatHeaderAction {
	icon: string;
	onClick: () => void;
	title: string;
	className?: string;
}

const ChatWithDelegates = ({ className }: Props) => {
	const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const [isNewChat, setIsNewChat] = useState(false);

	const openChat = () => {
		setIsModalOpen(true);
		setIsMinimized(false);
	};

	const chatHeaderActions: IChatHeaderAction[] = [
		{
			icon: '/assets/icons/delegation-chat/add-message-icon.svg',
			onClick: () => setIsNewChat(true),
			title: 'Add message'
		},
		{
			className: isMinimized ? 'transform rotate-180' : '',
			icon: '/assets/icons/delegation-chat/minimize-icon.svg',
			onClick: () => setIsMinimized((prev) => !prev),
			title: 'Minimize'
		},
		{
			icon: '/assets/icons/delegation-chat/close-icon.svg',
			onClick: () => setIsModalOpen(false),
			title: 'Close'
		}
	];

	return (
		<>
			<Button
				onClick={openChat}
				className={'h-10 w-10 border-pink_primary bg-white px-0 font-medium dark:bg-black'}
			>
				<Image
					src={'/assets/icons/delegation-chat/message-icon.svg'}
					height={20}
					width={20}
					alt='message icon'
				/>
			</Button>
			<Drawer
				title={<ChatHeader actions={chatHeaderActions} />}
				open={isModalOpen}
				placement='bottom'
				height={isMinimized ? 60 : 500}
				mask={false}
				closable={false}
				contentWrapperStyle={{ boxShadow: 'none', transform: 'none' }}
				style={{ position: 'fixed', right: '50px', top: 'auto', zIndex: '999' }}
				className={`${className} ${poppins.variable} ${poppins.className} w-[384px] rounded-md dark:bg-section-dark-overlay dark:text-blue-dark-high [&_.ant-drawer-header]:border-section-light-container`}
				bodyStyle={{ display: isMinimized ? 'none' : 'block', maxHeight: '440px', padding: '0px' }}
			>
				<UserChats
					isNewChat={isNewChat}
					setIsNewChat={setIsNewChat}
				/>
			</Drawer>
		</>
	);
};
export default ChatWithDelegates;

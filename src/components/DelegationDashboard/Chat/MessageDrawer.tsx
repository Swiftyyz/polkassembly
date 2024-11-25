// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Drawer } from 'antd';
import { dmSans } from 'pages/_app';
import { IChat } from '~src/types';
import Messages from './Messages';
import NewChat from './NewChat';
import MessageDrawerHeader from './MessageDrawerHeader';

interface Props {
	className?: string;
	openedChat?: IChat | null;
	isDrawerOpen: boolean;
	isNewChat: boolean;
	handleChatToggle: (chat?: IChat | null) => void;
	setFilteredRequests: React.Dispatch<React.SetStateAction<IChat[]>>;
}

const MessageDrawer = ({ className, isDrawerOpen, handleChatToggle, openedChat, isNewChat, setFilteredRequests }: Props) => {
	return (
		<Drawer
			title={<MessageDrawerHeader handleCloseChat={() => handleChatToggle(null)} />}
			open={isDrawerOpen}
			placement='bottom'
			height={500}
			mask={false}
			closable={false}
			contentWrapperStyle={{ boxShadow: 'none', transform: 'none' }}
			style={{ position: 'fixed', right: '450px', top: 'auto', zIndex: '999' }}
			className={`${className} ${dmSans.variable} ${dmSans.className} w-[384px] rounded-md shadow-xl dark:bg-section-dark-overlay dark:text-blue-dark-high [&_.ant-drawer-header]:border-section-light-container`}
			bodyStyle={{ maxHeight: '440px', padding: '0px' }}
		>
			{isNewChat ? (
				<NewChat handleOpenChat={handleChatToggle} />
			) : (
				openedChat?.chatId && (
					<Messages
						chatId={openedChat?.chatId}
						chat={openedChat}
						setFilteredRequests={setFilteredRequests}
					/>
				)
			)}
		</Drawer>
	);
};
export default MessageDrawer;

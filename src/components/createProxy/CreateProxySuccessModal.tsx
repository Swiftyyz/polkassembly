// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider, Modal } from 'antd';
import { poppins } from 'pages/_app';
import React from 'react';
import { styled } from 'styled-components';
import { CloseIcon, ProxyIcon } from '~src/ui-components/CustomIcons';
import Image from 'next/image';
import { useTheme } from 'next-themes';

interface Props {
	openModal: boolean;
	setOpenModal: (pre: boolean) => void;
	className: string;
}

const CreateProxySuccessModal = ({ openModal, setOpenModal, className }: Props) => {
	const { resolvedTheme: theme } = useTheme();

	return (
		<Modal
			title={
				<div>
					<div
						className={`${poppins.variable} ${poppins.className} flex items-center px-6 py-4 text-sm font-semibold text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high`}
					>
						<span className='flex items-center gap-x-2 text-xl font-semibold text-bodyBlue hover:text-pink_primary dark:text-blue-dark-high dark:hover:text-pink_primary'>
							<ProxyIcon className='userdropdown-icon text-2xl' />
							<span>Proxy</span>
						</span>
					</div>
					<Divider className='m-0 bg-section-light-container p-0 dark:bg-separatorDark' />
				</div>
			}
			open={openModal}
			footer={false}
			zIndex={1008}
			wrapClassName={' dark:bg-modalOverlayDark rounded-[14px]'}
			className={`${className} ${poppins.variable} ${poppins.className} w-[605px] rounded-[14px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			onCancel={() => setOpenModal(false)}
			closeIcon={<CloseIcon className=' text-lightBlue dark:text-icon-dark-inactive' />}
		>
			<div>Hello</div>
		</Modal>
	);
};

export default styled(CreateProxySuccessModal)`
	.ant-modal-content {
		padding: 0px !important;
		border-radius: 14px;
	}
`;

// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Alert, Button, Input, Modal } from 'antd';
import { poppins } from 'pages/_app';
import styled from 'styled-components';
import { CloseIcon } from './CustomIcons';
import ImageIcon from './ImageIcon';
import AddressDropdown from './AddressDropdown';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { useEffect, useState } from 'react';
import { setUserDetailsState } from '~src/redux/userDetails';
import { useDispatch } from 'react-redux';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import { useApiContext } from '~src/context';

interface Props {
	isModalOpen: boolean;
	setIsModalOpen: (pre: boolean) => void;
	className?: string;
}

const BecomeDelegateModal = ({ isModalOpen, setIsModalOpen, className }: Props) => {
	const { api, apiReady } = useApiContext();
	const currentUser = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const { loginWallet, loginAddress, delegationDashboardAddress } = currentUser;
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [defaultAddress, setAddress] = useState<string>(delegationDashboardAddress);
	const dispatch = useDispatch();

	const getAllAccounts = async () => {
		if (!api || !apiReady || !loginWallet) return;

		const addressData = await getAccountsFromWallet({ api, apiReady, chosenWallet: loginWallet, loginAddress, network });
		setAccounts(addressData?.accounts || []);
		setAddress(addressData?.account || '');
	};

	useEffect(() => {
		if (!api || !apiReady) return;

		getAllAccounts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [delegationDashboardAddress, api, apiReady]);

	return (
		<Modal
			title={
				<div className='flex items-center border-0 border-b-[1px] border-solid border-[#D2D8E0] px-5 py-4 text-[20px] font-semibold text-bodyBlue dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-blue-dark-medium'>
					Become A Delegate
				</div>
			}
			open={isModalOpen}
			footer={false}
			zIndex={1008}
			wrapClassName={`${className} dark:bg-modalOverlayDark`}
			className={`${poppins.variable} ${poppins.className} w-[605px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			onCancel={() => {
				setIsModalOpen && setIsModalOpen(false);
			}}
			closeIcon={<CloseIcon className='mt-2 text-lightBlue dark:text-icon-dark-inactive' />}
		>
			<div className='mt-6 px-5'>
				<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>Your Address</label>
				<AddressDropdown
					accounts={accounts}
					onAccountChange={(address) => {
						setAddress(address);
						dispatch(setUserDetailsState({ ...currentUser, delegationDashboardAddress: address }));
					}}
					defaultAddress={defaultAddress}
				/>
			</div>
			<div className='mt-6 px-5'>
				<label className='text-sm text-lightBlue dark:text-blue-dark-medium'>
					Your Bio<span className='font-semibold text-[#FF3C5F]'>*</span>
				</label>
				<Input
					className='p-3'
					placeholder='Add message for delegate address'
				/>
			</div>
			<div className='mb-7 mt-6 rounded-[4px] px-5'>
				<Alert
					message={
						<span className='text-sm '>
							To add socials to your delegate profile{' '}
							<span className='-mt-[2px] inline-flex cursor-pointer text-xs font-medium text-[#E5007A]'>
								<ImageIcon
									src='/assets/delegation-tracks/shield-icon-pink.svg'
									alt='shield icon'
									imgClassName='-mt-[3px] mr-[1.5px]'
								/>{' '}
								Set identity
							</span>{' '}
							with Polkassembly
						</span>
					}
					type='info'
					showIcon
					className='border-none'
				/>
			</div>
			<div className='mt-5 flex justify-end border-0 border-t-[1px] border-solid border-[#D2D8E0] px-5 py-4 dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-blue-dark-medium'>
				<Button
					className='w-full rounded-[4px] text-sm font-medium'
					type='primary'
				>
					Confirm
				</Button>
			</div>
		</Modal>
	);
};
export default styled(BecomeDelegateModal)`
	.ant-modal-content {
		padding: 0px !important;
		border-radius: 14px;
	}
`;

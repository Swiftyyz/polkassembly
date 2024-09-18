import { poppins } from 'pages/_app';
import React from 'react';
import Alert from '~src/basic-components/Alert';
import AddressesComponent from './AddressesComponent';

const AccountsMain = () => {
	return (
		<div>
			<div className='flex items-center justify-between'>
				<h2 className={`${poppins.className} ${poppins.variable} text-[28px] font-semibold text-blue-light-high dark:text-blue-dark-high`}>Accounts</h2>{' '}
			</div>
			<Alert
				showIcon
				type='warning'
				className='mt-2 px-4 py-2'
				description={
					<span className={`${poppins.className} ${poppins.variable} text-sm text-blue-light-high dark:text-blue-dark-high`}>To view all accounts from polkadot.js wallet</span>
				}
			/>
			<AddressesComponent />
		</div>
	);
};

export default AccountsMain;

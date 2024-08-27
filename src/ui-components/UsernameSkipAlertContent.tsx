// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CloseIcon } from './CustomIcons';
import ImageIcon from './ImageIcon';
interface Props {
	username: string;
	closeModal: () => void;
}

const UsernameSkipAlertContent = ({ username, closeModal }: Props) => {
	return (
		<div className='h-52'>
			<div>
				<div className='px-8 pb-2 pt-8 dark:bg-section-dark-overlay'>
					<div className='flex cursor-pointer justify-center'>
						<ImageIcon
							src='/assets/icons/Confirmation.svg'
							alt='confirmation logo'
							className='absolute -top-[80px]'
						/>
					</div>
					<div
						className='-mt-2 flex cursor-pointer items-end justify-end'
						onClick={() => closeModal()}
					>
						<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />
					</div>

					<p className='mt-20 justify-center text-center text-xl font-semibold text-bodyBlue dark:text-white'>We have assigned you a temporary username </p>
					<p className='mb-6 mt-4 flex items-center justify-center gap-1 text-center text-base font-medium text-bodyBlue dark:text-white'>
						You can visit<a href={`/user/${username}`}>Profile</a> and change it anytime
					</p>
				</div>
			</div>
		</div>
	);
};
export default UsernameSkipAlertContent;

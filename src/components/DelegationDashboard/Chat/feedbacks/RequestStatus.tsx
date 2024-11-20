// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Image from 'next/image';

interface Props {
	isRequestSent: boolean;
}

const RequestStatus = ({ isRequestSent }: Props) => (
	<div className={`mt-auto flex items-center gap-4 shadow-lg ${isRequestSent ? 'bg-[#31C4400F]' : 'bg-[#FFDF1A] text-blue-light-high'} px-5 py-2`}>
		<Image
			src={`/assets/icons/delegation-chat/${isRequestSent ? 'request-sent' : 'request-info'}.svg`}
			height={20}
			width={20}
			className={isRequestSent ? '' : 'dark:brightness-0 dark:contrast-100 dark:grayscale dark:invert dark:filter'}
			alt='chat icon'
		/>
		<span className='text-lightBlue dark:text-blue-dark-high'>{isRequestSent ? 'Message Request Sent!' : 'This message will be sent as a request.'}</span>
	</div>
);

export default RequestStatus;

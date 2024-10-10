// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Alert } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { ProposalType } from '~src/global/proposalType';
import { ILastVote } from '~src/types';
import VoteReferendumCard from '~src/components/Post/GovernanceSideBar/Referenda/VoteReferendumCard';
import { editCartPostValueChanged } from '~src/redux/batchVoting/actions';
import { useAppDispatch } from '~src/redux/store';
interface IDefaultVotingOptionsModal {
	theme?: string;
	forSpecificPost?: boolean;
	postEdit?: any;
	currentDecision?: string;
	voteInfo?: any;
}

const DefaultVotingOptionsModal: FC<IDefaultVotingOptionsModal> = (props) => {
	const { forSpecificPost, postEdit, currentDecision, voteInfo } = props;
	const { loginAddress } = useUserDetailsSelector();
	const dispatch = useAppDispatch();

	const [lastVote, setLastVote] = useState<ILastVote | null>(null);
	const [address, setAddress] = useState<string>(loginAddress);
	const onAccountChange = (address: string) => {
		setAddress(address);
	};
	console.log('voteinfo: ', voteInfo);

	useEffect(() => {
		if (voteInfo && forSpecificPost) {
			dispatch(
				editCartPostValueChanged({
					values: {
						abstainAyeVoteBalance: voteInfo?.ayeBalance || '0',
						abstainNyeVoteBalance: voteInfo?.nayBalance || '0',
						abstainVoteBalance: voteInfo?.abstainBalance || '0',
						ayeVoteBalance: voteInfo.ayeBalance || '0',
						conviction: voteInfo?.lockedPeriod || '0.1',
						nyeVoteBalance: voteInfo.nayBalance || '0',
						voteOption: voteInfo?.decision || 'aye'
					}
				})
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [voteInfo]);

	return (
		<section className='mt-4'>
			{!forSpecificPost ? (
				<Alert
					type='info'
					showIcon
					message={<span className='text-[13px] dark:text-black'>Select default values for votes. These can be edited before making a final transaction</span>}
				/>
			) : (
				<Alert
					type='info'
					showIcon
					message={
						<span className='m-0 flex gap-x-1 p-0 text-sm dark:text-black'>
							<p className='m-0 p-0 font-semibold'>Note:</p>All votes in the cart will be made from the selected account
						</span>
					}
				/>
			)}
			<VoteReferendumCard
				address={String(address)}
				postData={voteInfo?.proposal}
				onAccountChange={onAccountChange}
				proposalType={ProposalType.TREASURY_PROPOSALS}
				lastVote={lastVote as any}
				setLastVote={setLastVote}
				forSpecificPost={forSpecificPost}
				postEdit={postEdit}
				currentDecision={currentDecision}
			/>
		</section>
	);
};

export default DefaultVotingOptionsModal;

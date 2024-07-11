// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';

export interface IBatchVoteStore {
	batch_vote_details: IBatchVotesDetails;
}

export interface IBatchVotesDetails {
	voteOption?: string;
	voteBalance?: BN;
	ayeVoteBalance?: BN;
	nyeVoteBalance?: BN;
	abstainVoteBalance?: BN;
	conviction?: string;
}

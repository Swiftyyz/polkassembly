// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IBatchVotesDetails, IBatchVoteStore } from './@types';
import { HYDRATE } from 'next-redux-wrapper';

const initialState: IBatchVoteStore = {
	batch_vote_details: {}
};

type IBatchVotesPayload = {
	[K in keyof IBatchVotesDetails]: {
		key: K;
		value: IBatchVotesDetails[K];
	};
}[keyof IBatchVotesDetails];

export const batchVoteStore = createSlice({
	extraReducers: (builder) => {
		builder.addCase(HYDRATE, (state, action) => {
			console.log('hydrate campaigns', (action as PayloadAction<any>).payload);
			return {
				...state,
				...(action as PayloadAction<any>).payload.campaigns
			};
		});
	},
	initialState,
	name: 'batchVote',
	reducers: {
		reset: (state) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			state = {
				batch_vote_details: {}
			};
		},
		setBatchVoting_Field: (state, action: PayloadAction<IBatchVotesPayload>) => {
			const obj = action.payload;
			if (obj) {
				const { key, value } = obj;
				switch (key) {
					case 'voteOption':
						state.batch_vote_details[key] = value;
						break;
					case 'voteBalance':
						state.batch_vote_details[key] = value;
						break;
					case 'ayeVoteBalance':
						state.batch_vote_details[key] = value;
						break;
					case 'nyeVoteBalance':
						state.batch_vote_details[key] = value;
						break;
					case 'abstainVoteBalance':
						state.batch_vote_details[key] = value;
						break;
					case 'conviction':
						state.batch_vote_details[key] = value;
						break;
				}
			}
		}
	}
});

export default batchVoteStore.reducer;
const batchVotesActions = batchVoteStore.actions;
export { batchVotesActions };

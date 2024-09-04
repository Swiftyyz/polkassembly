// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
export interface IBatchVoteStore {
	batch_vote_details: IBatchVotesDetails;
	edit_vote_details: IBatchVotesDetails;
	vote_card_info: IVoteCardInfo;
	total_proposals_added_in_Cart: number;
	vote_card_info_array: IVoteCardInfo[];
	show_cart_menu: boolean;
	show_default_options_modal: boolean;
	total_active_posts: number;
	voted_post_ids_array: number[];
	voted_proposal_id: number;
	post_ids_array: number[];
	vote_cart_data: any[];
	is_default_selected: boolean;
}

export type IVoteCardInfo = {
	post_id: number;
	post_title: string;
	decision: string;
	voteConviction: number;
	voteBalance: any;
	posted?: boolean;
	abstainAyeBalance?: string;
	abstainNayBalance?: string;
};

export interface IBatchVotesDetails {
	voteOption?: string;
	ayeVoteBalance?: string;
	nyeVoteBalance?: string;
	abstainAyeVoteBalance?: string;
	abstainNyeVoteBalance?: string;
	abstainVoteBalance?: string;
	conviction?: number;
}

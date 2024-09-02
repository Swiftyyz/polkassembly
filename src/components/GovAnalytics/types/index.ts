// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

interface IDelegationAnalytics {
	totalCapital: string;
	totalDelegates: number;
	totalDelegators: number;
	totalVotesBalance: string;
}

export interface IDelegationInfo {
	[key: string]: IDelegationAnalytics;
}

export interface IGetStatusWiseProposalCount {
	categoryCounts: Record<string, number>;
}

export interface IGetStatusWiseRefOutcome {
	statusCounts: Record<string, number>;
}

export interface IGetTotalApprovedProposalCount {
	totalCount: number;
}

export interface TrackInfo {
	trackId: number;
	group: string;
}

export interface NetworkTrackInfo {
	[key: string]: TrackInfo;
}

export interface GroupedTrackIds {
	[key: string]: number[];
}

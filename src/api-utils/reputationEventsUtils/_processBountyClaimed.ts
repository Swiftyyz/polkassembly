// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import changeProfileScoreForAddress from 'pages/api/v1/utils/changeProfileScoreForAddress';
import REPUTATION_SCORES from '~src/util/reputationScores';

export async function _processBountyClaimed({ payeeAddress }: { payeeAddress: string }) {
	// process reputation scores for proposal 'Claim Bounty'

	const score = REPUTATION_SCORES.claim_bounty.value;

	await changeProfileScoreForAddress(payeeAddress, score);
}

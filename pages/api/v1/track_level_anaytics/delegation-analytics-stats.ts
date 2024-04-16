// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';
import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { MessageType } from '~src/auth/types';
import fetchSubsquid from '~src/util/fetchSubsquid';
import { GET_TRACK_LEVEL_ANALYTICS_DELEGATION_DATA } from '~src/queries';
import BN from 'bn.js';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';
import messages from '~src/auth/utils/messages';
import { IDelegatorsAndDelegatees } from '~src/types';
import { IDelegationAnalytics } from '~src/components/Analytics/types';

const ZERO_BN = new BN(0);

async function handler(req: NextApiRequest, res: NextApiResponse<IDelegationAnalytics | MessageType>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: messages.INVALID_NETWORK });

	const { trackNumber } = req.body;

	if (typeof trackNumber !== 'number') return res.status(400).json({ message: messages.INVALID_PARAMS });

	try {
		const data = await fetchSubsquid({
			network,
			query: GET_TRACK_LEVEL_ANALYTICS_DELEGATION_DATA,
			variables: {
				track_num: Number(trackNumber)
			}
		});
		let totalCapital = ZERO_BN;
		let totalVotesBalance = ZERO_BN;
		const totalDelegatorsObj: IDelegatorsAndDelegatees = {};
		const totalDelegateesObj: IDelegatorsAndDelegatees = {};

		if (data['data']?.votingDelegations?.length) {
			data['data']?.votingDelegations.map((delegation: { lockPeriod: number; balance: string; from: string; to: string }) => {
				const bnBalance = new BN(delegation?.balance);
				const bnConviction = new BN(delegation?.lockPeriod || 1);
				const vote = delegation?.lockPeriod ? bnBalance.mul(bnConviction) : bnBalance.div(new BN('10'));

				totalVotesBalance = totalVotesBalance.add(vote);

				totalCapital = totalCapital.add(bnBalance);

				if (totalDelegateesObj[delegation?.to] === undefined) {
					totalDelegateesObj[delegation?.to] = {
						count: 1,
						data: [{ capital: delegation.balance, from: delegation?.from, lockedPeriod: delegation.lockPeriod || 0.1, to: delegation?.to, votingPower: vote.toString() }]
					};
				} else {
					totalDelegateesObj[delegation?.to] = {
						count: totalDelegateesObj[delegation?.to]?.count + 1,
						data: [
							...(totalDelegateesObj[delegation?.to]?.data || []),
							{ capital: delegation.balance, from: delegation?.from, lockedPeriod: delegation.lockPeriod || 0.1, to: delegation?.to, votingPower: vote.toString() }
						]
					};
				}
				if (totalDelegatorsObj[delegation?.from] === undefined) {
					totalDelegatorsObj[delegation?.from] = {
						count: 1,
						data: [{ capital: delegation.balance, from: delegation?.from, lockedPeriod: delegation.lockPeriod || 0.1, to: delegation?.to, votingPower: vote.toString() }]
					};
				} else {
					totalDelegatorsObj[delegation?.from] = {
						count: totalDelegatorsObj[delegation?.to]?.count + 1,
						data: [
							...(totalDelegatorsObj[delegation?.to]?.data || []),
							{ capital: delegation.balance, from: delegation?.from, lockedPeriod: delegation.lockPeriod || 0.1, to: delegation.to, votingPower: vote.toString() }
						]
					};
				}
			});
		}

		const delegationStats: IDelegationAnalytics = {
			delegateesData: totalDelegateesObj,
			delegatorsData: totalDelegatorsObj,
			totalCapital: totalCapital.toString(),
			totalDelegates: Object.keys(totalDelegateesObj)?.length,
			totalDelegators: Object.keys(totalDelegatorsObj)?.length,
			totalVotesBalance: totalVotesBalance.toString()
		};
		return res.status(200).json(delegationStats);
	} catch (error) {
		return res.status(500).json({ message: error });
	}
}

export default withErrorHandling(handler);

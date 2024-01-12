// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import { ACTIVE_DELEGATIONS_TO_OR_FROM_ADDRESS_FOR_TRACK } from '~src/queries';
import { ETrackDelegationStatus, IDelegation } from '~src/types';
import fetchSubsquid from '~src/util/fetchSubsquid';
import getEncodedAddress from '~src/util/getEncodedAddress';

export interface ITrackDelegation {
	track: number;
	active_proposals_count: number;
	status: ETrackDelegationStatus[];
	recieved_delegation_count: number;
	delegations: IDelegation[];
}

export const getDelegationDashboardData = async (addresses: string[], network: string, trackNum?: number) => {
	if (!addresses.length || !network || !isOpenGovSupported(network)) return [];
	const encodedAddresses = addresses.map((address) => getEncodedAddress(address, network));

	const subsquidFetches: { [index: number]: any } = [];

	Object.values(networkTrackInfo[network]).map((trackInfo) => {
		if (trackInfo.fellowshipOrigin || (!isNaN(Number(trackNum)) && trackInfo.trackId !== trackNum)) return;
		subsquidFetches[trackInfo.trackId] = fetchSubsquid({
			network,
			query: ACTIVE_DELEGATIONS_TO_OR_FROM_ADDRESS_FOR_TRACK,
			variables: {
				address: encodedAddresses,
				track_eq: trackInfo.trackId
			}
		});
	});

	const subsquidResults = await Promise.allSettled(Object.values(subsquidFetches));

	const result: ITrackDelegation[] = [];

	for (const [index, trackDelegationData] of subsquidResults.entries()) {
		if (!trackDelegationData || trackDelegationData.status !== 'fulfilled') continue;
		const votingDelegationsArr = (trackDelegationData.value.data.votingDelegations || []) as IDelegation[];

		const track = Number(Object.keys(subsquidFetches)[index]);
		if (isNaN(track)) continue;

		const trackDelegation: ITrackDelegation = {
			active_proposals_count: trackDelegationData.value.data.proposalsConnection?.totalCount || 0,
			delegations: votingDelegationsArr,
			recieved_delegation_count: 0,
			status: [],
			track: Number(track)
		};

		// undelegated
		if (!votingDelegationsArr.length) {
			trackDelegation.status.push(ETrackDelegationStatus.UNDELEGATED);
			result.push(trackDelegation);
			continue;
		}

		for (const votingDelegation of votingDelegationsArr) {
			if (trackDelegation.status.length >= 2) break;

			if (encodedAddresses.includes(votingDelegation.from)) {
				if (!trackDelegation.status.includes(ETrackDelegationStatus.DELEGATED)) trackDelegation.status.push(ETrackDelegationStatus.DELEGATED);
			} else {
				if (!trackDelegation.status.includes(ETrackDelegationStatus.RECEIVED_DELEGATION)) trackDelegation.status.push(ETrackDelegationStatus.RECEIVED_DELEGATION);
			}
		}

		if (trackDelegation.status.includes(ETrackDelegationStatus.RECEIVED_DELEGATION)) {
			trackDelegation.recieved_delegation_count = votingDelegationsArr.filter((delegation) => !encodedAddresses.includes(delegation.from)).length;
		}

		result.push(trackDelegation);
	}

	return result;
};

async function handler(req: NextApiRequest, res: NextApiResponse<ITrackDelegation[] | { error: string }>) {
	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ error: 'Invalid network in request header' });

	const { addresses, track } = req.body;
	if (!addresses?.length) return res.status(400).json({ error: 'Missing address in request query.' });

	const trackNum = Number(track);
	if (track && isNaN(trackNum)) return res.status(400).json({ error: 'Invalid track in request query.' });

	const result = await getDelegationDashboardData(addresses as string[], network, !isNaN(trackNum) ? trackNum : undefined);
	return res.status(200).json(result as ITrackDelegation[]);
}

export default withErrorHandling(handler);

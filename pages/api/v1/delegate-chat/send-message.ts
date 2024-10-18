// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import type { NextApiRequest, NextApiResponse } from 'next';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { isValidNetwork } from '~src/api-utils';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { isAddress } from 'ethers';
import { IMessage } from '~src/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import { MessageType } from '~src/auth/types';
import messages from '~src/auth/utils/messages';
import authServiceInstance from '~src/auth/auth';
import * as admin from 'firebase-admin';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

const firestore_db = admin.firestore();

async function handler(req: NextApiRequest, res: NextApiResponse<IMessage[] | MessageType>) {
	storeApiKeyUsage(req);

	const network = String(req.headers['x-network']);
	if (!network || !isValidNetwork(network)) return res.status(400).json({ message: 'Invalid network in request header' });

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Invalid token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(403).json({ message: messages.UNAUTHORISED });

	const { address, senderAddress, receiverAddress, content, senderImage, chatId } = req.body;

	if (!address || !senderAddress.length || !receiverAddress.length || !content.length || !chatId.length) return res.status(400).json({ message: messages.INVALID_PARAMS });
	if (!(getEncodedAddress(String(address), network) || isAddress(String(address)))) return res.status(400).json({ message: 'Invalid address' });

	const encodedAddress = getEncodedAddress(address, network);

	const paDelegatesSnapshot = await firestore_db.collection('networks').doc(network).collection('pa_delegates').where('address', '==', encodedAddress).limit(1).get();

	if (paDelegatesSnapshot.empty && !paDelegatesSnapshot?.docs?.[0]) {
		return res.status(400).json({ message: `User with address ${address} is not a Polkassembly delegate` });
	}

	if (!senderAddress || !receiverAddress || senderAddress === receiverAddress) {
		return res.status(400).json({ message: 'Invalid senderAddress or receiverAddress' });
	}

	const chatSnapshot = firestore_db.collection('chats').doc(String(chatId));
	const messageSnapshot = chatSnapshot.collection('messages');

	const newMessage: IMessage = {
		content,
		created_at: new Date(),
		receiverAddress,
		senderAddress,
		senderImage,
		updated_at: new Date(),
		viewed_by: [senderAddress]
	};

	try {
		const batch = firestore_db.batch();
		const newMessageRef = messageSnapshot.doc();

		batch.set(newMessageRef, newMessage);
		batch.update(chatSnapshot, { latestMessage: newMessage, updated_at: new Date() });

		await batch.commit();

		return res.status(200).json({ message: messages.SUCCESS });
	} catch (error) {
		console.error('Error adding message: ', error);
		return res.status(500).json({ message: messages.ERROR_IN_ADDING_EVENT });
	}
}

export default withErrorHandling(handler);

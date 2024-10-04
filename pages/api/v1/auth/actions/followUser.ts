// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextApiRequest, NextApiResponse } from 'next';
import storeApiKeyUsage from '~src/api-middlewares/storeApiKeyUsage';

import withErrorHandling from '~src/api-middlewares/withErrorHandling';
import { followsCollRef } from '~src/api-utils/firestore_refs';
import authServiceInstance from '~src/auth/auth';
import { MessageType } from '~src/auth/types';
import getTokenFromReq from '~src/auth/utils/getTokenFromReq';
import messages from '~src/auth/utils/messages';
import { firestore_db } from '~src/services/firebaseInit';
import { IFollowEntry } from '~src/types';

async function handler(req: NextApiRequest, res: NextApiResponse<MessageType>) {
	storeApiKeyUsage(req);

	if (req.method !== 'POST') return res.status(405).json({ message: 'Invalid request method, POST required.' });

	// userId to follow
	const { userId } = req.body;
	if (Number.isNaN(userId)) return res.status(400).json({ message: 'Missing or invalid user id in request body' });

	const userIdToFollow = Number(userId);

	const token = getTokenFromReq(req);
	if (!token) return res.status(400).json({ message: 'Missing user token' });

	const user = await authServiceInstance.GetUser(token);
	if (!user) return res.status(400).json({ message: messages.USER_NOT_FOUND });

	if (user.id === userIdToFollow) {
		return res.status(400).json({ message: 'Cannot follow yourself' });
	}

	const userRef = firestore_db.collection('users').doc(String(userIdToFollow));
	const userDoc = await userRef.get();

	if (!userDoc.exists) {
		return res.status(404).json({ message: 'User to follow not found' });
	}

	const followsRef = followsCollRef();
	const followsDoc = await followsRef.where('follower_user_id', '==', user.id).where('followed_user_id', '==', userIdToFollow).get();

	if (!followsDoc.empty) {
		return res.status(400).json({ message: 'User already followed' });
	}

	const newFollowDoc = followsRef.doc();

	const newFollow: IFollowEntry = {
		created_at: new Date(),
		followed_user_id: userIdToFollow,
		follower_user_id: user.id,
		id: newFollowDoc.id,
		updated_at: new Date()
	};

	await newFollowDoc.set(newFollow);

	return res.status(200).json({ message: 'User followed' });
}

export default withErrorHandling(handler);

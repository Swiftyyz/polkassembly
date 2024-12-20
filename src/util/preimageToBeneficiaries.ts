// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IBeneficiary } from '~src/types';
import { containsBinaryData, convertAnyHexToASCII } from './decodingOnChainInfo';
import BN from 'bn.js';

const ZERO_BN = new BN(0);

const handleSpendCall = (call: any, network: string) => {
	const beneficiaries: IBeneficiary[] = [];
	const requested = new BN(call?.amount || 0)?.toString();
	let assetId = null;

	if (call?.assetKind?.assetId?.value?.interior || call?.assetKind?.assetId?.interior?.value) {
		const assetCall = call?.assetKind?.assetId?.value?.interior?.value || call?.assetKind?.assetId?.interior?.value;
		assetId = (assetCall?.length ? assetCall?.find((item: { value: number; __kind: string }) => item?.__kind == 'GeneralIndex')?.value : null) || null;
	}

	const beneficiary = {
		address: convertAnyHexToASCII(((call?.beneficiary as any)?.value?.interior?.value?.id as string) || (call?.beneficiary as any)?.value?.interior?.value?.[0]?.id, network) || '',
		amount: call?.amount,
		genralIndex: assetId || null
	};

	beneficiaries.push(beneficiary);
	return { assetId, beneficiaries, requested };
};

const handleSpenLocalCall = (call: any) => {
	const beneficiaries: IBeneficiary[] = [];

	const requested = new BN(call.amount)?.toString();

	if (call.beneficiary) {
		beneficiaries.push({
			address: (call?.beneficiary?.value as string) || (call.beneficiary as string),
			amount: call.amount || '0',
			genralIndex: null
		});
	}
	return { beneficiaries, requested };
};

const handleBatchCall = (args: any, network: string) => {
	if (!args) return { beneficiaries: [], remark: '', requested: '0' };
	let remark = '';
	let requestedAmt = ZERO_BN;
	const allBeneficiaries: IBeneficiary[] = [];

	args?.calls.forEach(({ value: call }: { value: any }) => {
		if (call && call.remark && typeof call.remark === 'string' && !containsBinaryData(call.remark)) {
			remark += call.remark + '\n';
		}
		if (call && call.__kind) {
			if (call?.__kind == 'spend_local') {
				const { requested, beneficiaries } = handleSpenLocalCall(call);
				requestedAmt = requestedAmt?.add(new BN(requested));
				allBeneficiaries.push(...(beneficiaries || []));
			}

			if (call?.__kind == 'spend') {
				const { beneficiaries } = handleSpendCall(call, network);
				allBeneficiaries.push(...(beneficiaries || []));
			}
		}
	});

	return { beneficiaries: allBeneficiaries || [], remark, requested: requestedAmt.toString() };
};

const preimageToBeneficiaries = (onchainCall: any, network: string) => {
	if (!onchainCall?.args) {
		return { assetId: null, beneficiaries: [], remark: '', requested: undefined };
	}
	console.log({ onchainCall });
	const method = onchainCall?.method;
	let value: { beneficiaries: IBeneficiary[]; requested: string; remark?: string; assetId?: any | null } = { beneficiaries: [], requested: '0' };
	switch (method) {
		case 'batch_all':
			value = handleBatchCall(onchainCall?.args, network);
			break;
		case 'spend_local':
			value = handleSpenLocalCall(onchainCall?.args);
			break;
		case 'spend':
			value = handleSpendCall(onchainCall?.args, network);
			break;
	}
	return { ...value, assetId: method == 'spend' ? value?.assetId || null : null };
};

export default preimageToBeneficiaries;

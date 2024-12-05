// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import Image from 'next/image';
import { Divider, Modal } from 'antd';
import { ChainPropType } from '~src/types';
import { dmSans } from 'pages/_app';
import RedirectingIcon from '~assets/treasury/redirecting-icon.svg';
import { styled } from 'styled-components';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import Link from 'next/link';

interface TreasuryDetailsModalProps {
	visible: boolean;
	onClose: () => void;
	available: number;
	assetValue: string;
	assetValueUSDC: string;
	assetValueUSDT: string;
	hydrationValue: string;
	hydrationValueUSDC: string;
	hydrationValueUSDT: string;
	chainProperties: ChainPropType;
	network: string;
	assethubApiReady: boolean;
	hydrationApiReady: boolean;
	unit: string;
	currentTokenPrice: string;
}

const TreasuryDetailsModal: React.FC<TreasuryDetailsModalProps> = ({
	visible,
	onClose,
	available,
	assetValue,
	assetValueUSDC,
	assetValueUSDT,
	hydrationValue,
	hydrationValueUSDC,
	hydrationValueUSDT,
	chainProperties,
	network,
	assethubApiReady,
	hydrationApiReady,
	unit,
	currentTokenPrice
}: TreasuryDetailsModalProps) => {
	const availableValue = parseFloat(String(available));
	const tokenPrice = parseFloat(currentTokenPrice || '0');
	const assetValueNum = parseFloat(assetValue || '0');
	const assetValueUSDCNum = parseFloat(assetValueUSDC || '0');
	const assetValueUSDTNum = parseFloat(assetValueUSDT || '0');
	const hydrationValueNum = parseFloat(hydrationValue || '0');
	const hydrationValueUSDCNum = parseFloat(hydrationValueUSDC || '0');
	const hydrationValueUSDTNum = parseFloat(hydrationValueUSDT || '0');

	const relayChainValue = formatUSDWithUnits(String(availableValue * Number(tokenPrice)));
	const assetHubValue = formatUSDWithUnits(String(assetValueNum * Number(tokenPrice) + assetValueUSDCNum * 1000000 + assetValueUSDTNum * 1000000));
	const hydrationValueTotal = formatUSDWithUnits(String(hydrationValueNum * Number(tokenPrice) + hydrationValueUSDCNum + hydrationValueUSDTNum));
	return (
		<Modal
			title={
				<div className=''>
					<div className={`${dmSans.className} ${dmSans.variable} text-xl font-semibold text-blue-light-high dark:text-blue-dark-high`}>Treasury Distribution</div>
					<Divider className='m-0 mt-2 bg-section-light-container p-0 dark:bg-separatorDark' />
				</div>
			}
			open={visible}
			className='w-fit p-0 px-0'
			onCancel={onClose}
			footer={null}
		>
			<div className=''>
				<div className={` ${dmSans.className} ${dmSans.variable} mb-[6px] mt-3 text-sm font-medium text-[#485F7DB2] dark:text-blue-dark-medium`}>Across Networks:</div>
				<div className='flex flex-col font-medium'>
					<div className={`${dmSans.className} ${dmSans.variable} mb-[6px] flex items-start gap-[6px] text-blue-light-high dark:text-blue-dark-high`}>
						<div className='flex w-[106px] gap-[6px]'>
							<Image
								alt='relay icon'
								width={20}
								height={20}
								src={'/assets/treasury/relay-chain-icon.svg'}
								className='-mt-[1px]'
							/>
							<span className={`${dmSans.className} ${dmSans.variable} text-sm font-medium `}>Relay Chain</span>
						</div>
						<div className={`${dmSans.className} ${dmSans.variable} -mt-[2px] flex flex-col`}>
							<span className='ml-1 text-base font-semibold'>~ ${relayChainValue}</span>
							<div className='ml-1 flex items-center gap-[6px] text-sm'>
								<Image
									alt='relay icon'
									width={16}
									height={16}
									src={'/assets/treasury/dot-icon.svg'}
									className='-mt-[2px]'
								/>
								<span className='font-medium'>{formatUSDWithUnits(String(available))} </span>
								{unit}
							</div>
						</div>
					</div>

					{chainProperties[network]?.assetHubTreasuryAddress && assethubApiReady && (
						<div className={`${dmSans.className} ${dmSans.variable} mb-[6px] flex items-start gap-[6px] text-blue-light-high dark:text-blue-dark-high`}>
							<div className='flex w-[106px] gap-[6px]'>
								<Image
									alt='relay icon'
									width={20}
									height={20}
									src={'/assets/icons/asset-hub-icon.svg'}
									className='-mt-[0px]'
								/>
								<span className='text-sm font-medium '>Asset Hub</span>
							</div>
							<div className='flex flex-col'>
								<span className='ml-1 text-base font-semibold'>~ ${assetHubValue}</span>
								<div className='flex items-center gap-1'>
									<div className='ml-1 flex items-center gap-[6px] text-sm'>
										<Image
											alt='relay icon'
											width={16}
											height={16}
											src={'/assets/treasury/dot-icon.svg'}
											className='-mt-[2px]'
										/>
										<span className='font-medium'>{formatUSDWithUnits(assetValue)}</span>
										{unit}
									</div>
									<div className='ml-1 flex items-center gap-[6px] text-sm'>
										<Image
											alt='relay icon'
											width={16}
											height={16}
											src={'/assets/treasury/usdc-icon.svg'}
											className='-mt-[2px]'
										/>
										<span className='font-medium'>{assetValueUSDC}</span>
										USDC
									</div>
									<div className='ml-1 flex items-center gap-[6px] text-sm'>
										<Image
											alt='relay icon'
											width={16}
											height={16}
											src={'/assets/treasury/usdt-icon.svg'}
											className='-mt-[2px]'
										/>
										<span className='font-medium'>{assetValueUSDT}</span>
										USDt
									</div>
									<Link
										href={'https://assethub-polkadot.subscan.io/account/14xmwinmCEz6oRrFdczHKqHgWNMiCysE2KrA4jXXAAM1Eogk'}
										className='-mb-1 cursor-pointer'
										target='_blank'
									>
										<RedirectingIcon />
									</Link>
								</div>
							</div>
						</div>
					)}

					{chainProperties[network]?.hydrationTreasuryAddress && hydrationApiReady && (
						<div className={`${dmSans.className} ${dmSans.variable} flex items-start gap-[6px] text-blue-light-high dark:text-blue-dark-high`}>
							<div className='flex w-[106px] gap-[6px]'>
								<Image
									alt='relay icon'
									width={20}
									height={20}
									src={'/assets/icons/hydration-icon.svg'}
									className='-mt-[0px]'
								/>
								<span className='text-sm font-medium '>Hydration</span>
							</div>
							<div className='flex flex-col'>
								<span className='ml-1 text-base font-semibold'>~ {hydrationValueTotal}</span>
								<div className='flex items-center gap-1'>
									<div className='ml-1 flex items-center gap-[6px] text-sm'>
										<Image
											alt='relay icon'
											width={16}
											height={16}
											src={'/assets/treasury/dot-icon.svg'}
											className='-mt-[2px]'
										/>
										<span className='font-medium'>{formatUSDWithUnits(hydrationValue)}</span>
										{unit}
									</div>
									<div className='ml-1 flex items-center gap-[6px] text-sm'>
										<Image
											alt='relay icon'
											width={16}
											height={16}
											src={'/assets/treasury/usdc-icon.svg'}
											className='-mt-[2px]'
										/>
										<span className='font-medium'>{hydrationValueUSDC} </span>
										USDC
									</div>
									<div className='ml-1 flex items-center gap-[6px] text-sm'>
										<Image
											alt='relay icon'
											width={16}
											height={16}
											src={'/assets/treasury/usdt-icon.svg'}
											className='-mt-[2px]'
										/>
										<span className='font-medium'>{hydrationValueUSDT} </span>
										USDt
									</div>
									<div className='flex gap-1 text-xs font-medium text-pink_primary'>
										<Link
											href={'https://hydration.subscan.io/account/7LcF8b5GSvajXkSChhoMFcGDxF9Yn9unRDceZj1Q6NYox8HY'}
											className='flex items-center gap-1'
											target='_blank'
										>
											Address #1 <RedirectingIcon />
										</Link>
										<Link
											href={'https://hydration.subscan.io/account/7KCp4eenFS4CowF9SpQE5BBCj5MtoBA3K811tNyRmhLfH1aV'}
											className='flex items-center gap-1'
											target='_blank'
										>
											Address #2 <RedirectingIcon />
										</Link>
									</div>
								</div>
							</div>
						</div>
					)}
					<Divider className='my-[10px] bg-section-light-container p-0 dark:bg-separatorDark' />
				</div>

				<div>
					<div className={`${dmSans.className} ${dmSans.variable} flex items-baseline gap-[6px] text-blue-light-high dark:text-blue-dark-high`}>
						<div className='flex w-[80px] gap-[6px]'>
							<span className='text-sm font-medium '>Bounties</span>
						</div>
						<div className='flex flex-col'>
							<span className='ml-1 text-base font-semibold'>~ $103.3M</span>
							<div className='ml-1 flex items-center gap-[6px] text-sm'>
								<Image
									alt='relay icon'
									width={16}
									height={16}
									src={'/assets/treasury/dot-icon.svg'}
									className='-mt-[2px]'
								/>
								<span className='font-medium'>~ $103.3M </span>
								{unit}
								<span className='-mb-[2px]'>
									<RedirectingIcon />
								</span>
							</div>
						</div>
					</div>

					<div className={`${dmSans.className} ${dmSans.variable} flex items-baseline gap-[6px] text-blue-light-high dark:text-blue-dark-high`}>
						<div className='flex w-[80px] gap-[6px]'>
							<span className='text-sm font-medium '>Fellowships</span>
						</div>
						<div className='flex flex-col'>
							<span className='ml-1 text-base font-semibold'>~ $103.3M</span>
							<div className='ml-1 flex items-center gap-[6px] text-sm'>
								<Image
									alt='relay icon'
									width={16}
									height={16}
									src={'/assets/treasury/dot-icon.svg'}
									className='-mt-[2px]'
								/>
								<span className='font-medium'>~ $103.3M </span>
								{unit}
								<span className='-mb-[2px]'>
									<RedirectingIcon />
								</span>
							</div>
						</div>
					</div>

					<div className={`${dmSans.className} ${dmSans.variable} flex items-baseline gap-[6px] text-blue-light-high dark:text-blue-dark-high`}>
						<div className='flex w-[80px] gap-[6px]'>
							<span className='text-sm font-medium '>Loans</span>
						</div>
						<div className='flex flex-col'>
							<span className='ml-1 text-base font-semibold'>~ $103.3M</span>
							<div className='ml-1 flex items-center gap-[6px] text-sm'>
								<Image
									alt='relay icon'
									width={16}
									height={16}
									src={'/assets/treasury/dot-icon.svg'}
									className='-mt-[2px]'
								/>
								<span className='font-medium'>~ $103.3M </span>
								{unit}
								<span className='-mb-[2px]'>
									<RedirectingIcon />
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default styled(TreasuryDetailsModal)`
	.ant-modal {
		width: auto;
	}
	.ant-modal-content {
		padding: 0px !important;
		border-radius: 14px;
		min-width: 100%;
	}
`;

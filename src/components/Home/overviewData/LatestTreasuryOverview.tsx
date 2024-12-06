// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import React, { useEffect, useState } from 'react';
import { CaretDownOutlined, CaretUpOutlined, LoadingOutlined } from '@ant-design/icons';
import { dmSans } from 'pages/_app';
import Image from 'next/image';
import AssethubIcon from '~assets/icons/asset-hub-icon.svg';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector } from '~src/redux/selectors';
import ProgressBar from '~src/basic-components/ProgressBar/ProgressBar';
import { useTheme } from 'next-themes';
import formatBnBalance from '~src/util/formatBnBalance';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import OverviewDataGraph from './OverviewDataGraph';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { IOverviewProps } from '~src/types';
import { IMonthlyTreasuryTally } from 'pages/api/v1/treasury-amount-history';
import useAssetHubApi from '~src/hooks/treasury/useAssetHubApi';
import useHydrationApi from '~src/hooks/treasury/useHydrationApi';
import TreasuryAssetDisplay from './TreasuryAssetDisplay';
import BN from 'bn.js';
import TreasuryDetailsModal from './TreasuryDetailsModal';

const LatestTreasuryOverview = ({ currentTokenPrice, available, priceWeeklyChange, spendPeriod, nextBurn, tokenValue, isUsedInGovAnalytics }: IOverviewProps) => {
	const { network } = useNetworkSelector();
	const { assethubApiReady, assethubValues, fetchAssetsAmount } = useAssetHubApi(network);
	const { hydrationApiReady, hydrationValues, fetchHydrationAssetsAmount } = useHydrationApi(network);
	const unit = chainProperties?.[network]?.tokenSymbol;
	const { resolvedTheme: theme } = useTheme();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const trailColor = theme === 'dark' ? '#1E262D' : '#E5E5E5';

	const [graphData, setGraphData] = useState<IMonthlyTreasuryTally[]>([]);

	const BN_MILLION = new BN(10).pow(new BN(6));

	const assetValue = formatBnBalance(new BN(assethubValues.dotValue), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network);
	const assetValueFellowship = formatBnBalance(new BN(assethubValues.dotValueFellowship), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network);
	const assetValueUSDC = formatUSDWithUnits(new BN(assethubValues.usdcValue).div(BN_MILLION).toString());
	const assetValueUSDT = formatUSDWithUnits(new BN(assethubValues.usdtValue).div(BN_MILLION).toString());
	const assetValueUSDTFellowship = formatUSDWithUnits(new BN(assethubValues.usdtValueFellowship).div(BN_MILLION).toString());

	const hydrationValue = formatBnBalance(new BN(hydrationValues.dotValue), { numberAfterComma: 0, withThousandDelimitor: false, withUnit: false }, network);
	const hydrationValueUSDC = formatUSDWithUnits(new BN(hydrationValues.usdcValue).div(BN_MILLION).toString());
	const hydrationValueUSDT = formatUSDWithUnits(new BN(hydrationValues.usdtValue).div(BN_MILLION).toString());

	const fetchDataFromApi = async () => {
		try {
			const { data, error } = await nextApiClientFetch('/api/v1/treasury-amount-history/old-treasury-data');

			if (error) {
				console.error('Error fetching data:', error);
			}
			if (data) {
				return;
			}

			const { data: dailyData, error: dailyError } = await nextApiClientFetch('/api/v1/treasury-amount-history/daily-treasury-tally');

			if (dailyError) {
				console.error('Error fetching daily data:', dailyError);
			}
			if (dailyData) return;
		} catch (error) {
			console.error('Unexpected error:', error);
		}
	};

	const getGraphData = async () => {
		try {
			const { data, error } = await nextApiClientFetch<IMonthlyTreasuryTally[]>('/api/v1/treasury-amount-history');

			if (error) {
				console.error('Error fetching data:', error);
			}
			if (data) {
				setGraphData(data);
			}
		} catch (error) {
			console.error('Unexpected error:', error);
		}
	};

	useEffect(() => {
		fetchDataFromApi();
		getGraphData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	useEffect(() => {
		if (assethubApiReady) {
			fetchAssetsAmount();
		}
		if (hydrationApiReady) {
			fetchHydrationAssetsAmount();
		}
	}, [assethubApiReady, hydrationApiReady, fetchAssetsAmount, fetchHydrationAssetsAmount]);

	const closeModal = () => setIsModalVisible(false);

	const totalUsdcPrice = formatUSDWithUnits(new BN(assethubValues.usdcValue).add(new BN(hydrationValues.usdcValue)).div(BN_MILLION).add(new BN(3000000)).toString());
	const totalUsdtPrice = formatUSDWithUnits(new BN(assethubValues.usdtValue).add(new BN(hydrationValues.usdtValue)).div(BN_MILLION).add(new BN(2420000)).toString());

	const dotPrice = new BN('29600000').mul(new BN(String(Number(currentTokenPrice.value || 0) * 1000000))).div(new BN('1000000'));
	const usdcPrice = new BN('7100000');
	const usdtPrice = new BN('8900000');
	const mythPrice = new BN('4800000').mul(new BN('370000')).div(new BN('1000000'));

	const totalUsd = formatUSDWithUnits(dotPrice.add(usdcPrice).add(usdtPrice).add(mythPrice).toString());

	return (
		<div
			className={`${dmSans.className} ${dmSans.variable} ${
				isUsedInGovAnalytics ? '' : `${!['polymesh', 'polymesh-test'].includes(network) ? 'md:grid-cols-2' : ''} grid grid-cols-1 gap-x-8 gap-y-8 md:gap-y-0`
			}`}
		>
			<div
				className={`flex w-full flex-1 flex-col rounded-xxl bg-white ${isUsedInGovAnalytics ? '' : 'p-3 drop-shadow-md lg:px-6 lg:py-4'}  dark:bg-section-dark-overlay sm:my-0 `}
			>
				<div className=''>
					<div>
						{!available.isLoading ? (
							<>
								<div className='mb-2 '>
									<div className='flex items-center justify-between'>
										{!isUsedInGovAnalytics && (
											<div className='my-1 flex items-center gap-x-[6px]'>
												<span className=' p-0 text-sm font-normal leading-5 text-lightBlue dark:text-blue-dark-medium'>Treasury</span>
												<HelperTooltip
													text='Funds collected through a portion of block production rewards, transaction fees, slashing, staking inefficiencies, etc.'
													className='text-xs font-medium leading-5 text-lightBlue dark:text-blue-dark-medium'
												/>
											</div>
										)}
										<div className={`${dmSans.className} ${dmSans.variable} flex items-baseline gap-x-1 self-end`}>
											<span className={' flex text-xs font-normal leading-5 text-lightBlue dark:text-blue-dark-medium'}>{chainProperties[network]?.tokenSymbol} Price</span>
											<div className='flex items-center gap-x-1 text-lg font-semibold'>
												<div>
													{currentTokenPrice.value === 'N/A' ? (
														<span className=' text-bodyBlue dark:text-blue-dark-high'>N/A</span>
													) : currentTokenPrice.value && !isNaN(Number(currentTokenPrice.value)) ? (
														<span className='ml-[2px] mt-1 text-bodyBlue dark:text-blue-dark-high'>${currentTokenPrice.value}</span>
													) : null}
												</div>
												{priceWeeklyChange.value !== 'N/A' && (
													<div className='-mb-[2px] ml-2 flex items-center'>
														<span className={`text-xs font-medium ${Number(priceWeeklyChange.value) < 0 ? 'text-[#F53C3C]' : 'text-[#52C41A]'} `}>
															{Math.abs(Number(priceWeeklyChange.value))}%
														</span>
														<span>
															{Number(priceWeeklyChange.value) < 0 ? (
																<CaretDownOutlined style={{ color: 'red', marginBottom: '0px', marginLeft: '1.5px' }} />
															) : (
																<CaretUpOutlined style={{ color: '#52C41A', marginBottom: '10px', marginLeft: '1.5px' }} />
															)}
														</span>
													</div>
												)}
											</div>
										</div>
									</div>
									<div className='flex items-center gap-1'>
										<div>
											{totalUsd && (
												<div className='flex items-baseline'>
													<span className={`${dmSans.className} ${dmSans.variable} no-wrap text-xl font-semibold text-blue-light-high dark:text-blue-dark-high`}>~${totalUsd}</span>
												</div>
											)}
										</div>
										<div className='flex items-center gap-1'>
											<div className='no-wrap ml-1 flex items-center gap-1 text-xs'>
												<Image
													alt='relay icon'
													width={16}
													height={16}
													src={'/assets/treasury/dot-icon.svg'}
													className='-mt-[2px]'
												/>
												<span className='text-xs font-medium text-blue-light-high dark:text-blue-dark-high'>~ 29.6M</span>
												{unit}
											</div>
											<div className='no-wrap ml-1 flex items-center gap-[6px] text-xs'>
												<Image
													alt='relay icon'
													width={16}
													height={16}
													src={'/assets/treasury/usdc-icon.svg'}
													className='-mt-[2px]'
												/>
												<span className='text-xs font-medium text-blue-light-high dark:text-blue-dark-high'>{totalUsdcPrice}</span>
												USDC
											</div>
											<Divider
												type='vertical'
												className='border-l-1 mx-0 ml-[2px] mt-[2px] border-[#90A0B7] dark:border-icon-dark-inactive max-sm:hidden'
											/>
											<div className='no-wrap ml-1 flex items-center gap-[6px] text-xs'>
												<Image
													alt='relay icon'
													width={16}
													height={16}
													src={'/assets/treasury/usdt-icon.svg'}
													className='-mt-[2px]'
												/>
												<span className='text-xs font-medium text-blue-light-high dark:text-blue-dark-high'>{totalUsdtPrice}</span>
												USDt
											</div>
											<Divider
												type='vertical'
												className='border-l-1 mx-0 ml-[2px] mt-[2px] border-[#90A0B7] dark:border-icon-dark-inactive max-sm:hidden'
											/>
											<div className='no-wrap flex items-center gap-1'>
												<Image
													src={'/assets/treasury/myth-icon.svg'}
													width={16}
													height={16}
													alt='icon'
												/>
												<span className='text-xs font-medium text-blue-light-high dark:text-blue-dark-high'>4.8M MYTH</span>
											</div>
										</div>
									</div>
								</div>
							</>
						) : (
							<div className={`flex ${isUsedInGovAnalytics ? 'min-h-[32px]' : 'min-h-[89px]'} w-full items-center justify-center`}>
								<LoadingOutlined />
							</div>
						)}
					</div>
					{/* // current Price */}
					<TreasuryDetailsModal
						visible={isModalVisible}
						onClose={closeModal}
						available={tokenValue}
						assetValue={assetValue}
						assetValueFellowship={assetValueFellowship}
						assetValueUSDC={assetValueUSDC}
						assetValueUSDT={assetValueUSDT}
						assetValueUSDTFellowship={assetValueUSDTFellowship}
						hydrationValue={hydrationValue}
						hydrationValueUSDC={hydrationValueUSDC}
						hydrationValueUSDT={hydrationValueUSDT}
						chainProperties={chainProperties}
						network={network}
						assethubApiReady={assethubApiReady}
						hydrationApiReady={hydrationApiReady}
						unit={unit}
						currentTokenPrice={currentTokenPrice.value}
					/>
					{!['moonbase', 'polimec', 'rolimec', 'westend', 'laos-sigma', 'mythos'].includes(network) && (
						<div>
							{!available.isLoading && (
								<div
									className='cursor-pointer text-xs font-medium text-pink_primary'
									onClick={() => setIsModalVisible(true)}
								>
									Details
									<Image
										alt='arrow icon'
										width={16}
										height={16}
										src={'/assets/treasury/arrow-icon.svg'}
										className='-mt-[2px]'
									/>
								</div>
							)}
						</div>
					)}
				</div>
				{/* graph */}
				<div>
					<OverviewDataGraph
						graphData={graphData}
						currentTokenPrice={currentTokenPrice}
					/>
				</div>
			</div>
			{!isUsedInGovAnalytics && (
				<div className='flex w-full flex-1 flex-col gap-5 rounded-xxl bg-white p-3 drop-shadow-md dark:bg-section-dark-overlay sm:my-0 lg:px-6 lg:py-4'>
					{/* Current Price */}
					{['moonbase', 'polimec', 'rolimec'].includes(network) && (
						<>
							<div>
								{!(currentTokenPrice.isLoading || priceWeeklyChange.isLoading) ? (
									<div className='flex flex-col justify-between gap-2 xl:flex-row'>
										<div className='flex items-baseline justify-start font-medium xl:justify-between'>
											{available.value ? (
												<div className='flex items-baseline whitespace-nowrap'>
													<span className='text-lg font-medium text-bodyBlue dark:text-blue-dark-high'>{available.value}</span>
													<span className='ml-1 text-base font-medium text-blue-light-medium dark:text-blue-dark-medium'>{chainProperties[network]?.tokenSymbol}</span>
												</div>
											) : (
												<span>N/A</span>
											)}
											{!['polymesh', 'polymesh-test'].includes(network) && (
												<span className='ml-2 whitespace-nowrap text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>
													{available.valueUSD ? `~ $${available.valueUSD}` : 'N/A'}
												</span>
											)}
										</div>

										{chainProperties[network]?.assetHubTreasuryAddress && (
											<TreasuryAssetDisplay
												title='Asset Hub'
												icon={<AssethubIcon />}
												value={assetValue}
												unit={unit}
												valueUSDT={assetValueUSDT}
												valueUSDC={assetValueUSDC}
												isLoading={!assethubApiReady}
												supportedAssets={chainProperties[network]?.supportedAssets}
											/>
										)}
									</div>
								) : (
									<div className='flex min-h-[50px] w-full items-center justify-center'>
										<LoadingOutlined />
									</div>
								)}
							</div>
							<Divider className='m-0 bg-section-light-container p-0 dark:bg-separatorDark' />
						</>
					)}

					{/* Spend Period */}
					{!['polymesh', 'polymesh-test'].includes(network) && (
						<>
							<div className='w-full flex-col gap-x-0 lg:flex'>
								{!spendPeriod.isLoading ? (
									<>
										<div className='sm:mb-2'>
											<div className='flex items-center'>
												<span
													className={`${dmSans.className} ${dmSans.variable} mr-2 pt-[3px] text-sm font-normal leading-5 text-lightBlue dark:text-blue-dark-medium md:mt-1 lg:mt-0`}
												>
													Spend Period Remaining
												</span>

												<HelperTooltip
													text='Funds requested from the treasury are periodically distributed at the end of the spend period.'
													className='text-xs font-medium leading-5 text-lightBlue dark:text-blue-dark-medium'
												/>
											</div>

											<div
												className={`${dmSans.className} ${dmSans.variable} flex items-baseline whitespace-pre pt-[5px] font-medium text-bodyBlue dark:text-blue-dark-high sm:mt-0`}
											>
												{spendPeriod.value?.total ? (
													<>
														{spendPeriod.value?.days ? (
															<>
																<span className='text-base font-medium sm:text-lg'>{spendPeriod.value.days}&nbsp;</span>
																<span className='text-xs text-lightBlue dark:text-blue-dark-medium'>days&nbsp;</span>
															</>
														) : null}
														<>
															<span className='text-base font-medium sm:text-lg'>{spendPeriod.value.hours}&nbsp;</span>
															<span className='text-xs text-lightBlue dark:text-blue-dark-medium'>hrs&nbsp;</span>
														</>
														{!spendPeriod.value?.days ? (
															<>
																<span className='text-base font-medium sm:text-lg'>{spendPeriod.value.minutes}&nbsp;</span>
																<span className='text-xs text-lightBlue dark:text-blue-dark-medium'>mins&nbsp;</span>
															</>
														) : null}
														<span className='text-xs text-lightBlue dark:text-blue-dark-medium sm:text-xs'>/ {spendPeriod.value.total} days </span>
													</>
												) : (
													'N/A'
												)}
											</div>
										</div>
										<span className=' flex items-center gap-[10px]'>
											<ProgressBar
												className=' flex items-center p-0'
												percent={!isNaN(Number(spendPeriod.percentage)) ? spendPeriod.percentage : 0}
												trailColor={trailColor}
												strokeColor='#E5007A'
												size='small'
												showInfo={false}
											/>
											<span className={`${dmSans.className} ${dmSans.variable} -mb-3 text-xs font-medium text-blue-light-high dark:text-blue-dark-high`}>
												{!isNaN(Number(spendPeriod.percentage)) ? spendPeriod.percentage : 0}%
											</span>
										</span>
									</>
								) : (
									<div className='flex min-h-[50px] w-full items-center justify-center'>
										<LoadingOutlined />
									</div>
								)}
							</div>
							<Divider className='m-0 bg-section-light-container p-0 dark:bg-separatorDark' />
						</>
					)}

					{/* Next Burn */}
					{!['moonbeam', 'kilt', 'moonbase', 'moonriver', 'polymesh', 'polimec', 'rolimec'].includes(network) && (
						<div>
							<div className='w-full gap-x-0 lg:flex'>
								{!nextBurn.isLoading ? (
									<div className='items-start sm:flex sm:gap-2'>
										<div className='h-12'>
											<div className={`${dmSans.className} ${dmSans.variable} flex flex-col text-xs`}>
												<span className='text-xs font-normal leading-5 text-lightBlue dark:text-blue-dark-medium'>Next Burn</span>
												<div className='flex items-baseline gap-x-[6px]'>
													{nextBurn.value ? (
														<div className='flex items-baseline gap-x-[3px]'>
															<span className='text-lg font-medium'>{nextBurn.value}</span>
															<span className='text-base font-medium text-lightBlue dark:text-blue-dark-high'>{chainProperties[network]?.tokenSymbol}</span>
														</div>
													) : null}
													<span className='text-[12px] font-normal text-lightBlue dark:text-blue-dark-high'>{nextBurn.valueUSD ? `~ $${nextBurn.valueUSD}` : 'N/A'}</span>
												</div>
											</div>
										</div>
										<p
											className={`${dmSans.className} ${dmSans.variable} mt-2 flex-1 rounded-lg bg-[#F4F5F6] px-3 py-2 text-xs font-normal text-[#333843] dark:bg-[#333843] dark:text-[#F4F5F6] sm:mt-0`}
										>
											If the Treasury ends a spend period without spending all of its funds, it suffers a burn of a percentage of its funds.
										</p>
									</div>
								) : (
									<div className='flex min-h-[50px] w-full items-center justify-center'>
										<LoadingOutlined />
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default LatestTreasuryOverview;

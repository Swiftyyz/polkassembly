// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { EDelegationAddressFilters, EDelegationSourceFilters, IDelegateAddressDetails } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import DelegateCard from './DelegateCard';
import ImageIcon from '~src/ui-components/ImageIcon';
import { Pagination } from '~src/ui-components/Pagination';
import { useTheme } from 'next-themes';
import { Alert, Button, Radio, Spin, Checkbox } from 'antd';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import Input from '~src/basic-components/Input';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import getEncodedAddress from '~src/util/getEncodedAddress';
import DelegatesProfileIcon from '~assets/icons/white-delegated-profile.svg';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import DelegateModal from '../Listing/Tracks/DelegateModal';
import Popover from '~src/basic-components/Popover';
import { poppins } from 'pages/_app';

const TrendingDelegates = () => {
	const { network } = useNetworkSelector();
	const { delegationDashboardAddress } = useUserDetailsSelector();
	const [loading, setLoading] = useState<boolean>(false);
	const [delegatesData, setDelegatesData] = useState<IDelegateAddressDetails[]>([]);
	const [filteredDelegates, setFilteredDelegates] = useState<IDelegateAddressDetails[]>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [showMore, setShowMore] = useState<boolean>(false);
	const [addressAlert, setAddressAlert] = useState<boolean>(false);
	const [open, setOpen] = useState<boolean>(false);
	const { resolvedTheme: theme } = useTheme();
	const [address, setAddress] = useState<string>('');
	const [selectedSources, setSelectedSources] = useState<EDelegationSourceFilters[]>([]);
	const [sortOption, setSortOption] = useState<EDelegationAddressFilters | null>(EDelegationAddressFilters.ALL);

	useEffect(() => {
		if (!address) return;
		if (getEncodedAddress(address, network) && address !== getEncodedAddress(address, network)) {
			setAddressAlert(true);
		}
		setTimeout(() => {
			setAddressAlert(false);
		}, 5000);
	}, [network, address]);

	const getData = async () => {
		if (!getEncodedAddress(address, network) && address.length > 0) return;
		setLoading(true);
		const { data, error } = await nextApiClientFetch<any>('api/v1/delegations/getAllDelegates', {
			address: address,
			filterBy: sortOption || EDelegationAddressFilters.ALL
		});
		if (data && data.data) {
			setDelegatesData(data.data);
			setLoading(false);
		} else {
			console.log(error);
			setLoading(false);
		}
	};

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, sortOption, network]);

	useEffect(() => {
		let updatedDelegates = [...delegatesData];

		if (selectedSources.length > 0) {
			updatedDelegates = updatedDelegates.filter((delegate) => {
				return delegate.dataSource && selectedSources.some((source) => delegate.dataSource.includes(source));
			});
		}

		if (sortOption === EDelegationAddressFilters.ALL) {
			updatedDelegates.sort((a, b) => {
				const addressess = [
					getSubstrateAddress('13mZThJSNdKUyVUjQE9ZCypwJrwdvY8G5cUCpS9Uw4bodh4t'),
					getSubstrateAddress('1wpTXaBGoyLNTDF9bosbJS3zh8V8D2ta7JKacveCkuCm7s6'),
					getSubstrateAddress('F1wAMxpzvjWCpsnbUMamgKfqFM7LRvNdkcQ44STkeVbemEZ'),
					getSubstrateAddress('5CJX6PHkedu3LMdYqkHtGvLrbwGJustZ78zpuEAaxhoW9KbB')
				];
				const aIndex = addressess.indexOf(getSubstrateAddress(a.address));
				const bIndex = addressess.indexOf(getSubstrateAddress(b.address));

				if (aIndex !== -1 && bIndex !== -1) {
					return aIndex - bIndex;
				}

				if (aIndex !== -1) return -1;
				if (bIndex !== -1) return 1;
				return 0;
			});
		}

		setFilteredDelegates(updatedDelegates);
	}, [delegatesData, selectedSources, sortOption]);

	const handleCheckboxChange = (source: EDelegationSourceFilters, checked: boolean) => {
		setSelectedSources((prevSources) => {
			if (checked) {
				return [...prevSources, source];
			} else {
				return prevSources.filter((item) => item !== source);
			}
		});
	};

	const handleRadioChange = (e: any) => {
		const selectedOption = e.target.value;
		setSortOption((prevOption) => (prevOption === selectedOption ? null : selectedOption));
	};

	const itemsPerPage = showMore ? filteredDelegates.length : 6;
	const totalPages = Math.ceil(delegatesData.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = showMore ? delegatesData.length : startIndex + itemsPerPage;

	const prevPage = () => {
		setCurrentPage((oldPage) => {
			let prevPage = oldPage - 1;
			if (prevPage < 1) {
				prevPage = totalPages;
			}
			return prevPage;
		});
	};

	const nextPage = () => {
		setCurrentPage((oldPage) => {
			let nextPage = oldPage + 1;
			if (nextPage > totalPages) {
				nextPage = 1;
			}
			return nextPage;
		});
	};

	useEffect(() => {
		if (showMore && currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [showMore, currentPage, delegatesData.length, itemsPerPage, totalPages]);

	const fitlerContent = (
		<div className='flex flex-col'>
			{Object.values(EDelegationSourceFilters).map((source, index) => (
				<div
					key={index}
					className={`${poppins.variable} ${poppins.className} flex gap-[8px] p-[4px] text-sm font-medium tracking-[0.01em] text-bodyBlue dark:text-blue-dark-high`}
				>
					<Checkbox
						checked={selectedSources.includes(source)}
						onChange={(e) => handleCheckboxChange(source, e.target.checked)}
						className='cursor-pointer text-pink_primary'
					/>
					<span className='mt-[3px] text-xs'>{source.charAt(0).toUpperCase() + source.slice(1)}</span>
				</div>
			))}
		</div>
	);

	const sortContent = (
		<div className='flex flex-col'>
			<Radio.Group
				className='flex flex-col overflow-y-auto'
				onChange={handleRadioChange}
				value={sortOption || null}
			>
				<Radio
					value={EDelegationAddressFilters.DELEGATED_VOTES}
					className={`${poppins.variable} ${poppins.className} my-[1px] flex gap-[8px] p-[4px] text-xs font-medium text-bodyBlue dark:text-blue-dark-high`}
				>
					Voting Power
				</Radio>
				<Radio
					value={EDelegationAddressFilters.VOTED_PROPOSALS}
					className={`${poppins.variable} ${poppins.className} my-[1px] flex gap-[8px] p-[4px] text-xs font-medium text-bodyBlue dark:text-blue-dark-high`}
				>
					Voted proposals (past 30 days)
				</Radio>
				<Radio
					value={EDelegationAddressFilters.RECEIVED_DELEGATIONS}
					className={`${poppins.variable} ${poppins.className} my-[1px] flex gap-[8px] p-[4px] text-xs font-medium text-bodyBlue dark:text-blue-dark-high`}
				>
					Received Delegation(s)
				</Radio>
			</Radio.Group>
		</div>
	);
	return (
		<div className='mt-[32px] rounded-xxl bg-white p-5 drop-shadow-md dark:bg-section-dark-overlay md:p-6'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center space-x-3'>
					<ImageIcon
						src='/assets/delegation-tracks/trending-icon.svg'
						alt='trending icon'
						imgClassName='h-6 w-6 mt-[2.5px]'
					/>
					<span className='text-xl font-semibold'>Trending Delegates</span>
					<div className='flex space-x-[6px]'>
						<div
							onClick={prevPage}
							style={{ transform: 'rotateY(180deg)' }}
						>
							<ImageIcon
								src='/assets/delegation-tracks/chevron-right.svg'
								alt='chevron left icon'
								className='cursor-pointer'
							/>
						</div>
						<div onClick={nextPage}>
							<ImageIcon
								src='/assets/delegation-tracks/chevron-right.svg'
								alt='chevron right icon'
								className='cursor-pointer'
							/>
						</div>
					</div>
				</div>
				<span
					onClick={() => setShowMore(!showMore)}
					className='mr-[3px] cursor-pointer text-xs font-medium text-pink_primary'
				>
					{showMore ? 'Show Less' : 'Show All'}
				</span>
			</div>

			<h4 className={'mb-4 mt-4 text-sm font-normal text-bodyBlue dark:text-white '}>Enter an address or Select from the list below to delegate your voting power</h4>

			<div className='flex items-center gap-3'>
				<div className='dark:placeholder:white flex h-[48px] w-full items-center justify-between rounded-md border-[1px] border-solid border-section-light-container text-sm font-normal text-[#576D8BCC] dark:border-[#3B444F] dark:border-separatorDark dark:text-white'>
					{/* Input Component */}
					<Input
						placeholder='Enter address to Delegate vote'
						onChange={(e) => setAddress(e.target.value)}
						value={address}
						className='h-[44px] border-none dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
					/>

					<CustomButton
						variant='primary'
						className={'ml-1 mr-1 justify-around gap-2 px-4 py-1'}
						height={40}
						onClick={() => {
							setOpen(true);
							setAddress(address);
						}}
						disabled={
							!address || !getEncodedAddress(address, network) || address === delegationDashboardAddress || getEncodedAddress(address, network) === delegationDashboardAddress
						}
					>
						<DelegatesProfileIcon />
						<span className='text-sm font-medium text-white'>Delegate</span>
					</CustomButton>
				</div>

				<Popover
					content={fitlerContent}
					placement='bottomRight'
					zIndex={1056}
				>
					<Button className='border-1 flex h-12 w-12 items-center justify-center rounded-md border-solid border-section-light-container dark:border-borderColorDark dark:bg-section-dark-overlay'>
						<ImageIcon
							src='/assets/icons/filter-icon-delegates.svg'
							alt='filter icon'
						/>
					</Button>
				</Popover>

				<Popover
					content={sortContent}
					placement='topRight'
					zIndex={1056}
				>
					<Button className='border-1 flex h-12 w-12 items-center justify-center rounded-md border-solid border-section-light-container dark:border-borderColorDark dark:bg-section-dark-overlay'>
						<ImageIcon
							src='/assets/icons/sort-icon-delegates.svg'
							alt='sort icon'
						/>
					</Button>
				</Popover>
			</div>

			{getEncodedAddress(address, network) === delegationDashboardAddress && (
				<label className='mt-1 text-sm font-normal text-red-500'>You cannot delegate to your own address. Please enter a different wallet address.</label>
			)}

			{!address || (!getEncodedAddress(address, network) && <label className='mt-1 text-sm font-normal text-red-500 '>Invalid Address.</label>)}
			{addressAlert && (
				<Alert
					className='mb-4 mt-4 dark:border-infoAlertBorderDark dark:bg-infoAlertBgDark'
					showIcon
					type='info'
					message={<span className='dark:text-blue-dark-high'>The substrate address has been changed to {network} address.</span>}
				/>
			)}

			<Spin spinning={loading}>
				<div className='min-h-[200px]'>
					{filteredDelegates.length < 1 && !loading ? (
						//empty state
						<ImageIcon
							src='/assets/icons/empty-state-image.svg'
							alt='empty icon'
							imgWrapperClassName='h-40 w-40 mx-auto mt-[60px]'
						/>
					) : (
						<>
							<div className='mt-6 grid grid-cols-2 items-end gap-6 max-lg:grid-cols-1'>
								{filteredDelegates.slice(startIndex, endIndex).map((delegate, index) => (
									<DelegateCard
										key={index}
										delegate={delegate}
										disabled={!delegationDashboardAddress}
									/>
								))}
							</div>
							{!showMore && delegatesData.length > 6 && (
								<div className='mt-6 flex justify-end'>
									<Pagination
										theme={theme}
										size='large'
										defaultCurrent={1}
										current={currentPage}
										onChange={(page: number) => {
											setCurrentPage(page);
										}}
										total={filteredDelegates.length}
										showSizeChanger={false}
										pageSize={itemsPerPage}
										responsive={true}
										hideOnSinglePage={true}
									/>
								</div>
							)}
						</>
					)}
				</div>
			</Spin>
			<DelegateModal
				defaultTarget={address}
				open={open}
				setOpen={setOpen}
			/>
		</div>
	);
};

export default TrendingDelegates;

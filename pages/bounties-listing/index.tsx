// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { GetServerSideProps } from 'next';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { spaceGrotesk } from 'pages/_app';
import React, { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { LeftOutlined } from '@ant-design/icons';
import BountyProposalActionButton from '~src/components/Bounties/bountyProposal';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { IBountyListing } from '~src/components/Bounties/BountiesListing/types/types';
import { getAllBounties } from 'pages/api/v1/bounty/bountyDashboard/getAllBounties';
import { ErrorState } from '~src/ui-components/UIStates';
import { useRouter } from 'next/router';
import { BOUNTIES_LISTING_LIMIT } from '~src/global/listingLimit';
import { Pagination } from '~src/ui-components/Pagination';
import BountiesTabItems from '~src/components/Bounties/BountiesListing/BountiesTabItems';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { ArrowRightOutlined } from '@ant-design/icons';

interface IBountiesListingProps {
	data?: {
		bounties: IBountyListing[];
		totalBountiesCount: number;
	};
	error?: string;
	network: string;
}
export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const network = getNetworkFromReqHeaders(req?.headers);
	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const page = query?.page || 1;
	const filterBy = query?.filterBy ? JSON.parse(decodeURIComponent(String(query?.filterBy))) : [];
	const status = query?.status ? JSON.parse(decodeURIComponent(String(query?.status))) : '';

	const { data } = await getAllBounties({
		categories: filterBy,
		network,
		page: Number(page),
		status
	});

	return {
		props: {
			data,
			network
		}
	};
};

const BountiesListing: FC<IBountiesListingProps> = (props) => {
	const { data, error, network } = props;
	const dispatch = useDispatch();
	const { resolvedTheme: theme } = useTheme();
	const router = useRouter();
	const onPaginationChange = (page: number) => {
		router?.push({
			pathname: router?.pathname,
			query: {
				...router?.query,
				page
			}
		});
	};
	const bounties = data?.bounties ?? [];
	const totalBountiesCount = data?.totalBountiesCount ?? 0;
	const currentUser = useUserDetailsSelector();
	const address = currentUser?.loginAddress;
	const [curatorData, setCuratorData] = React.useState<any>();
	const [curatorrequestdata, setCuratorRequestData] = React.useState<any>();

	const fetchCuratorBountiesData = async () => {
		if (address) {
			const substrateAddress = getSubstrateAddress(address);
			const { data } = await nextApiClientFetch<any>('api/v1/bounty/curator/getCuratorGeneralInfo', {
				userAddress: substrateAddress
			});
			const { data: curatorrequestdata } = await nextApiClientFetch<any>('/api/v1/bounty/curator/getReqCount', {
				userAddress: currentUser?.loginAddress
			});
			if (curatorrequestdata) {
				setCuratorRequestData(curatorrequestdata);
			}
			if (data) {
				setCuratorData(data);
			}
		}
	};
	const hasBounties = curatorData?.allBounties?.count > 0 || curatorData?.childBounties?.count > 0;
	const hasCuratorRequests = curatorrequestdata?.curator > 0;
	const hasSubmissions = curatorrequestdata?.submissions > 0;

	const shouldRenderLink = hasBounties || hasCuratorRequests || hasSubmissions;

	useEffect(() => {
		fetchCuratorBountiesData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address]);

	useEffect(() => {
		dispatch(setNetwork(props?.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props?.network]);

	if (error) return <ErrorState errorMessage={error} />;

	return (
		<div>
			<SEOHead
				title='On-chain bounties'
				desc='Discover and participate in treasury-funded bounties on Polkassembly, where members can propose and work on projects to improve the governance and growth of our community.'
				network={network}
			/>
			<div>
				<Link
					className='inline-flex items-center text-sidebarBlue hover:text-pink_primary dark:text-white'
					href='/bounty-dashboard'
					aria-label='Back to Bounty Dashboard'
				>
					<div className='flex items-center'>
						<LeftOutlined
							className='mr-2 text-xs'
							aria-hidden='true'
						/>
						<span className='text-sm font-medium'>Back to Bounty Dashboard</span>
					</div>
				</Link>

				<div className='flex items-center justify-between pt-4'>
					<span className={`${spaceGrotesk.className} ${spaceGrotesk.variable} text-[32px] font-bold text-blue-light-high dark:text-blue-dark-high dark:text-lightWhite`}>
						On-chain Bounties
					</span>
					<div className='flex gap-2'>
						<BountyProposalActionButton className='hidden md:block' />
						{shouldRenderLink && (
							<Link
								href='/bounty-dashboard/curator-dashboard'
								className={`cursor-pointer rounded-xl text-base font-bold text-white hover:text-white ${spaceGrotesk.className} ${spaceGrotesk.variable} px-6 py-3`}
								style={{
									background: `
									radial-gradient(395.27% 77.56% at 25.57% 34.38%, rgba(255, 255, 255, 0.30) 0%, rgba(255, 255, 255, 0.00) 100%),
									radial-gradient(192.36% 96% at -3.98% 12.5%, #4B33FF 13.96%, #83F 64.39%, rgba(237, 66, 179, 0.00) 100%),
									radial-gradient(107.92% 155.46% at 50% 121.74%, #F512EE 0%, #62A0FD 80.98%)
								`,
									boxShadow: '1px 1px 4px 0px rgba(255, 255, 255, 0.50) inset'
								}}
							>
								Curator Dashboard <ArrowRightOutlined className='-rotate-45 font-bold' />
							</Link>
						)}
					</div>
				</div>

				<BountiesTabItems bounties={bounties} />

				<div className='mb-5 mt-3 flex justify-end'>
					{totalBountiesCount > BOUNTIES_LISTING_LIMIT && (
						<Pagination
							pageSize={BOUNTIES_LISTING_LIMIT}
							current={Number(router?.query?.page) || 1}
							total={totalBountiesCount}
							showSizeChanger={false}
							hideOnSinglePage={true}
							onChange={onPaginationChange}
							responsive={true}
							theme={theme}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default BountiesListing;

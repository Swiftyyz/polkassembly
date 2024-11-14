// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useState } from 'react';
import { Button, Divider, Modal, Timeline } from 'antd';
import styled from 'styled-components';
import SignupPopup from '~src/ui-components/SignupPopup';
import LoginPopup from '~src/ui-components/loginPopup';
import { usePostDataContext } from '~src/context';
import { Collapse } from '~src/components/Settings/Notifications/common-ui/Collapse';
import { useTheme } from 'next-themes';
import { ClockCircleOutlined, StarFilled } from '@ant-design/icons';
import dayjs from 'dayjs';
import ReportDetails from './ReportDetails';
import RatingSuccessModal from '../RatingModal/RatingSuccessModal';
import { progressReportActions } from '~src/redux/progressReport';
import { ArrowDownIcon, CloseIcon } from '~src/ui-components/CustomIcons';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import classNames from 'classnames';
import { poppins } from 'pages/_app';
import RatingModal from '../RatingModal';
import { useDispatch } from 'react-redux';
import { useProgressReportSelector, useUserDetailsSelector } from '~src/redux/selectors';
import queueNotification from '~src/ui-components/QueueNotification';
import { NotificationStatus } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import Image from 'next/image';

const { Panel } = Collapse;

interface IUserReportInfo {
	className?: string;
	theme?: string;
}

const UserReportInfo: FC<IUserReportInfo> = (props) => {
	const { className } = props;
	const [openLogin, setLoginOpen] = useState<boolean>(false);
	const [openSignup, setSignupOpen] = useState<boolean>(false);
	const { loginAddress } = useUserDetailsSelector();
	const { postData, setPostData } = usePostDataContext();
	const [loading, setLoading] = useState<boolean>(false);
	const { resolvedTheme: theme } = useTheme();
	const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
	const dispatch = useDispatch();
	const { open_rating_modal, open_rating_success_modal, report_rating } = useProgressReportSelector();

	const addUserRating = async () => {
		setLoading(true);
		const { data, error: editError } = await nextApiClientFetch<any>('api/v1/progressReport/addReportRating', {
			postId: postData?.postIndex,
			proposalType: postData?.postType,
			rating: report_rating,
			reportId: selectedReportId
		});
		if (editError || !data) {
			setLoading(false);
			console.error('Error saving rating', editError);
			queueNotification({
				header: 'Error!',
				message: 'Error in saving your rating.',
				status: NotificationStatus.ERROR
			});
		}

		if (data) {
			setLoading(false);
			queueNotification({
				header: 'Success!',
				message: 'Your rating is now added',
				status: NotificationStatus.SUCCESS
			});
			const { progress_report } = data;
			setPostData((prev) => ({
				...prev,
				progress_report
			}));
			dispatch(progressReportActions.setOpenRatingModal(false));
			dispatch(progressReportActions.setOpenRatingSuccessModal(true));
		} else {
			console.log('failed to save rating');
		}
	};

	return (
		<section className={`${className} mt-8`}>
			<Timeline className={`${className}`}>
				{postData?.progress_report && Object.keys(postData.progress_report).length > 0 ? (
					Object.entries(postData?.progress_report)
						.sort(([, a], [, b]) => new Date((a as any)?.created_at)?.getTime() - new Date((b as any)?.created_at)?.getTime())
						.map(([key, report]: any, index) => (
							<Timeline.Item
								key={key}
								className='-mt-6'
								dot={
									<div className='flex h-8 w-8 items-center justify-center rounded-full bg-[#EAECEE] text-sidebarBlue dark:bg-highlightBg dark:text-white'>
										{Object.keys(postData?.progress_report).length - index}
									</div>
								}
							>
								<>
									<Collapse
										size='large'
										theme={theme as any}
										className='ml-1  bg-white dark:border-separatorDark dark:bg-section-dark-overlay'
										expandIconPosition='end'
										expandIcon={({ isActive }) =>
											isActive ? <ArrowDownIcon className=' rotate-180 dark:text-blue-dark-medium' /> : <ArrowDownIcon className=' dark:text-blue-dark-medium' />
										}
										defaultActiveKey={index === 0 ? ['1'] : []}
									>
										<Panel
											header={
												<div className='-mt-1 flex w-full items-center justify-between space-x-4'>
													<div className='flex items-center gap-x-2'>
														<h1 className='m-0 p-0 text-base font-medium text-bodyBlue dark:text-white'>{`Progress Report #${
															Object.keys(postData?.progress_report).length - index
														}`}</h1>
														<ClockCircleOutlined className='dark:text-icon-dark-inactive' />
														<p className='m-0 p-0 text-xs text-lightBlue dark:text-icon-dark-inactive'>{dayjs(report?.created_at).format('DD MMM YYYY')}</p>
														{report?.isEdited && <p className='m-0 ml-auto p-0 text-[10px] text-sidebarBlue dark:text-blue-dark-medium'>(Edited)</p>}
														{report?.isFromOgtracker && (
															<Image
																src='/assets/icons/ogTracker.svg'
																alt='ogtracker'
																height={20}
																width={20}
															/>
														)}
													</div>
													{!report?.isFromOgtracker && (
														<Button
															className='m-0 flex items-center justify-start gap-x-1 border-none bg-transparent p-0 text-sm font-normal text-pink_primary'
															onClick={() => {
																if (loginAddress) {
																	dispatch(progressReportActions.setOpenRatingModal(true));
																	setSelectedReportId(report?.id);
																} else {
																	setLoginOpen(true);
																}
															}}
														>
															<StarFilled />
															<p className='m-0 p-0'>Rate Progress</p>
														</Button>
													)}
												</div>
											}
											key='1'
										>
											<ReportDetails
												report={report}
												index={index}
											/>
										</Panel>
									</Collapse>
									{index + 1 !== Object.keys(postData.progress_report).length && (
										<Divider
											style={{ background: '#D2D8E0', flexGrow: 1 }}
											className='mt-5 dark:bg-separatorDark'
										/>
									)}
								</>
							</Timeline.Item>
						))
				) : (
					<p className='m-0 p-0 text-sm text-bodyBlue dark:text-white'>No progress reports available</p>
				)}
			</Timeline>

			<SignupPopup
				setLoginOpen={setLoginOpen}
				modalOpen={openSignup}
				setModalOpen={setSignupOpen}
				isModal={true}
			/>
			<LoginPopup
				setSignupOpen={setSignupOpen}
				modalOpen={openLogin}
				setModalOpen={setLoginOpen}
				isModal={true}
			/>

			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				className={classNames(poppins.className, poppins.variable, 'w-[600px]')}
				open={open_rating_modal}
				footer={
					<div className='-mx-6 mt-9 flex items-center justify-end gap-x-2 border-0 border-t-[1px] border-solid border-section-light-container px-6 pb-2 pt-6'>
						<CustomButton
							variant='default'
							text='Cancel'
							buttonsize='sm'
							disabled={loading}
							onClick={() => {
								dispatch(progressReportActions.setOpenRatingModal(false));
							}}
						/>
						<CustomButton
							variant='primary'
							loading={loading}
							className={`${loading ? 'opacity-60' : ''}`}
							text='Rate'
							buttonsize='sm'
							disabled={loading}
							onClick={() => {
								addUserRating();
								setSelectedReportId(selectedReportId);
							}}
						/>
					</div>
				}
				maskClosable={false}
				closeIcon={<CloseIcon className='mt-2 text-lightBlue dark:text-icon-dark-inactive' />}
				onCancel={() => {
					dispatch(progressReportActions.setOpenRatingModal(false));
				}}
				title={
					<div className='-mx-6 flex items-center justify-start border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-5 text-lg tracking-wide text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high'>
						<StarFilled className='mr-2' />
						Rate Delivery of Progress Report
					</div>
				}
			>
				<RatingModal reportId={selectedReportId} />
			</Modal>
			<Modal
				wrapClassName='dark:bg-modalOverlayDark'
				className={classNames(poppins.className, poppins.variable, 'mt-[100px] w-[600px]')}
				open={open_rating_success_modal}
				maskClosable={false}
				footer={null}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				onCancel={() => {
					dispatch(progressReportActions.setOpenRatingSuccessModal(false));
				}}
			>
				<RatingSuccessModal reportId={selectedReportId} />
			</Modal>
		</section>
	);
};

export default styled(UserReportInfo)`
	.ant-collapse-header {
		padding: 0 !important;
	}
	.ant-timeline .ant-timeline-item-tail {
		border-inline-start: ${({ theme }: { theme: any }) => (theme === 'dark' ? '1.5px solid #4b4b4b' : '1.5px solid #485f7d')} !important;
	}
	.ant-collapse {
		border: none !important;
	}
	.ant-collapse .ant-collapse-content {
		border: none !important;
	}
	.ant-collapse > .ant-collapse-item {
		border: none !important;
	}
	.ant-collapse-large > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box {
		padding: 0 !important;
	}
	.ant-timeline .ant-timeline-item-tail {
		height: calc(100% - 15px) !important;
	}
`;

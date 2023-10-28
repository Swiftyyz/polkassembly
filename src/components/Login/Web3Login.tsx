// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined } from '@ant-design/icons';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { stringToHex } from '@polkadot/util';
import { Alert, Button, Divider, Form, Input } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { FC, useEffect, useState } from 'react';
import { APPNAME } from 'src/global/appName';
import { handleTokenChange } from 'src/services/auth.service';
import { NotificationStatus, Wallet } from 'src/types';
import AccountSelectionForm from 'src/ui-components/AccountSelectionForm';
import AuthForm from 'src/ui-components/AuthForm';
import FilteredError from 'src/ui-components/FilteredError';
import Loader from 'src/ui-components/Loader';
import getEncodedAddress from 'src/util/getEncodedAddress';
import LoginLogo from '~assets/icons/login-logo.svg';
import { ChallengeMessage, IAddProfileResponse, IAuthResponse, TokenType } from '~src/auth/types';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import ExtensionNotDetected from '../ExtensionNotDetected';
import { WalletIcon } from './MetamaskLogin';
import Image from 'next/image';
import WalletButtons from './WalletButtons';
import MultisigAccountSelectionForm from '~src/ui-components/MultisigAccountSelectionForm';
import TFALoginForm from './TFALoginForm';
import BN from 'bn.js';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useDispatch } from 'react-redux';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { IconConfirmation, BlueCautionIcon, IconMail } from '~src/ui-components/CustomIcons';
import messages from '~src/util/messages';
import { password, username } from '~src/util/validation';
import * as validation from 'src/util/validation';
import queueNotification from '~src/ui-components/QueueNotification';
import nameBlacklist from '~src/auth/utils/nameBlacklist';

const ZERO_BN = new BN(0);
interface Props {
	chosenWallet: Wallet;
	setDisplayWeb2: () => void;
	setWalletError: React.Dispatch<React.SetStateAction<string | undefined>>;
	isModal?: boolean;
	setLoginOpen?: (pre: boolean) => void;
	setSignupOpen?: (pre: boolean) => void;
	onWalletUpdate?: () => void;
	withPolkasafe?: boolean;
	setChosenWallet: any;
}

const initAuthResponse: IAuthResponse = {
	isTFAEnabled: false,
	tfa_token: '',
	token: '',
	user_id: 0
};

const Web3Login: FC<Props> = ({ chosenWallet, setDisplayWeb2, setWalletError, isModal, setLoginOpen, setSignupOpen, withPolkasafe, setChosenWallet, onWalletUpdate }) => {
	const { network } = useNetworkSelector();

	const router = useRouter();
	const currentUser = useUserDetailsSelector();
	const dispatch = useDispatch();

	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const [address, setAddress] = useState<string>('');
	const [multisigAddress, setMultisigAddress] = useState<string>('');
	const [isAccountLoading, setIsAccountLoading] = useState(true);
	const [extensionNotFound, setExtensionNotFound] = useState(false);
	const [accountsNotFound, setAccountsNotFound] = useState(false);
	const [fetchAccounts, setFetchAccounts] = useState(true);
	const [isSignUp, setIsSignUp] = useState(false);
	const [authResponse, setAuthResponse] = useState<IAuthResponse>(initAuthResponse);
	const [multisigBalance, setMultisigBalance] = useState<BN>(ZERO_BN);
	const [showOptionalFields, setShowOptionalFields] = useState(false);
	const [optionalUsername, setOptionalUsername] = useState('');
	const [showSuccessModal, setShowSuccessModal] = useState(true);
	const [isError, setIsError] = useState(false);
	const [firstPassword, setFirstPassword] = useState('');
	const [email, setEmail] = useState('');
	const userDetailsContext = useUserDetailsSelector();

	const handleClick = () => {
		if (isModal && setSignupOpen && setLoginOpen) {
			setSignupOpen(true);
			setLoginOpen(false);
		} else {
			router.push('/signup');
		}
	};

	const getAccounts = async (chosenWallet: Wallet): Promise<undefined> => {
		const injectedWindow = window as Window & InjectedWindow;

		const wallet = isWeb3Injected ? injectedWindow.injectedWeb3[chosenWallet] : null;

		if (!wallet) {
			setExtensionNotFound(true);
			setIsAccountLoading(false);
			return;
		} else {
			setExtensionNotFound(false);
		}

		let injected: Injected | undefined;
		try {
			injected = await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error('Wallet Timeout'));
				}, 60000); // wait 60 sec

				if (wallet && wallet.enable) {
					wallet
						.enable(APPNAME)
						.then((value) => {
							clearTimeout(timeoutId);
							resolve(value);
						})
						.catch((error) => {
							reject(error);
						});
				}
			});
		} catch (err) {
			setIsAccountLoading(false);
			console.log(err?.message);
			if (err?.message == 'Rejected') {
				setWalletError('');
				handleToggle();
			} else if (err?.message == 'Pending authorisation request already exists for this site. Please accept or reject the request.') {
				setWalletError('Pending authorisation request already exists. Please accept or reject the request on the wallet extension and try again.');
				handleToggle();
			} else if (err?.message == 'Wallet Timeout') {
				setWalletError('Wallet authorisation timed out. Please accept or reject the request on the wallet extension and try again.');
				handleToggle();
			}
		}
		if (!injected) {
			return;
		}

		const accounts = await injected.accounts.get();
		if (accounts.length === 0) {
			setAccountsNotFound(true);
			setIsAccountLoading(false);
			return;
		} else {
			setAccountsNotFound(false);
		}

		accounts.forEach((account) => {
			account.address = getEncodedAddress(account.address, network) || account.address;
		});

		setAccounts(accounts);
		if (accounts.length > 0) {
			setAddress(accounts[0].address);
		}

		setIsAccountLoading(false);
		return;
	};

	const onAccountChange = (address: string) => {
		setAddress(address);
		setMultisigAddress('');
	};

	const handleLogin: (values: React.BaseSyntheticEvent<object, any, any> | undefined) => void = async () => {
		if (!accounts.length) return getAccounts(chosenWallet);

		try {
			const injectedWindow = window as Window & InjectedWindow;
			const wallet = isWeb3Injected ? injectedWindow.injectedWeb3[chosenWallet] : null;

			if (!wallet) {
				setExtensionNotFound(true);
				setIsAccountLoading(false);
				return;
			} else {
				setExtensionNotFound(false);
			}

			const injected = wallet && wallet.enable && (await wallet.enable(APPNAME));

			const signRaw = injected && injected.signer && injected.signer.signRaw;
			if (!signRaw) return console.error('Signer not available');

			setLoading(true);

			let substrate_address;
			if (!address.startsWith('0x')) {
				substrate_address = getSubstrateAddress(address);
				if (!substrate_address) return console.error('Invalid address');
			} else {
				substrate_address = address;
			}

			const { data: loginStartData, error: loginStartError } = await nextApiClientFetch<ChallengeMessage>('api/v1/auth/actions/addressLoginStart', {
				address: substrate_address,
				wallet: chosenWallet
			});
			if (loginStartError) {
				console.log('Error in address login start', loginStartError);
				setError(loginStartError);
				setLoading(false);
				return;
			}
			const signMessage = loginStartData?.signMessage;

			if (!signMessage) {
				throw new Error('Challenge message not found');
			}

			const { signature } = await signRaw({
				address: substrate_address,
				data: stringToHex(signMessage),
				type: 'bytes'
			});

			const { data: addressLoginData, error: addressLoginError } = await nextApiClientFetch<IAuthResponse>('api/v1/auth/actions/addressLogin', {
				address: substrate_address,
				multisig: multisigAddress,
				signature,
				wallet: chosenWallet
			});
			if (addressLoginError) {
				setError(addressLoginError);
				// TODO: change this method of checking if user is already signed up
				if (addressLoginError === 'Please sign up prior to logging in with a web3 address') {
					setIsSignUp(true);
					try {
						setLoading(true);
						const { data, error } = await nextApiClientFetch<ChallengeMessage>('api/v1/auth/actions/addressSignupStart', { address: substrate_address, multisig: multisigAddress });
						if (error || !data) {
							setError(error || 'Something went wrong');
							setLoading(false);
							return;
						}

						const signMessage = data?.signMessage;
						if (!signMessage) {
							setError('Challenge message not found');
							setLoading(false);
							return;
						}

						const { signature } = await signRaw({
							address: substrate_address,
							data: stringToHex(signMessage),
							type: 'bytes'
						});

						const { data: confirmData, error: confirmError } = await nextApiClientFetch<TokenType>('api/v1/auth/actions/addressSignupConfirm', {
							address: substrate_address,
							multisig: multisigAddress,
							signature: signature,
							wallet: chosenWallet
						});

						if (confirmError || !confirmData) {
							setError(confirmError || 'Something went wrong');
							setLoading(false);
							return;
						}

						if (confirmData.token) {
							const user: any = {};
							user.loginWallet = chosenWallet;
							user.loginAddress = multisigAddress || address;
							user.multisigAssociatedAddress = address;
							user.delegationDashboardAddress = multisigAddress || address;
							localStorage.setItem('delegationWallet', chosenWallet);
							localStorage.setItem('delegationDashboardAddress', multisigAddress || address);
							localStorage.setItem('multisigDelegationAssociatedAddress', address);
							localStorage.setItem('loginWallet', chosenWallet);
							localStorage.setItem('loginAddress', address);
							localStorage.setItem('multisigAssociatedAddress', address);
							handleTokenChange(confirmData.token, { ...currentUser, ...user }, dispatch);
							if (isModal) {
								setLoginOpen && setLoginOpen(false);
								setLoading(false);
								return;
							}
							{
								router.push(isOpenGovSupported(network) ? '/opengov' : '/');
							}
						} else {
							throw new Error('Web3 Login failed');
						}
					} catch (error) {
						setError(error.message);
						setLoading(false);
					}
				}
				setLoading(false);
				return;
			}

			if (addressLoginData?.token) {
				const user: any = {};
				user.loginWallet = chosenWallet;
				user.loginAddress = multisigAddress || address;
				user.delegationDashboardAddress = multisigAddress || address;
				user.multisigAssociatedAddress = address;
				localStorage.setItem('delegationWallet', chosenWallet);
				localStorage.setItem('delegationDashboardAddress', multisigAddress || address);
				localStorage.setItem('multisigDelegationAssociatedAddress', address);
				localStorage.setItem('loginWallet', chosenWallet);
				localStorage.setItem('loginAddress', address);

				localStorage.setItem('multisigAssociatedAddress', address);
				handleTokenChange(addressLoginData.token, { ...currentUser, ...user }, dispatch);
				if (isModal) {
					setLoginOpen?.(true);
					setShowOptionalFields(true);
					setLoading(false);
					return;
				}
				router.push(isOpenGovSupported(network) ? '/opengov' : '/');
			} else if (addressLoginData?.isTFAEnabled) {
				if (!addressLoginData?.tfa_token) {
					setError(error || 'TFA token missing. Please try again.');
					setLoading(false);
					return;
				}

				setAuthResponse(addressLoginData);
				setLoading(false);
			}
		} catch (error) {
			setError(error.message);
			setLoading(false);
		}
	};

	const validateUsername = (optionalUsername: string) => {
		let errorUsername = 0;
		const format = /^[a-zA-Z0-9_@]*$/;
		if (!format.test(optionalUsername) || optionalUsername.length > 30 || optionalUsername.length < 3) {
			queueNotification({
				header: 'Error',
				message: 'Username is Invalid',
				status: NotificationStatus.ERROR
			});
			errorUsername += 1;
		}

		// banned username
		for (let i = 0; i < nameBlacklist.length; i++) {
			if (optionalUsername.toLowerCase().includes(nameBlacklist[i])) {
				queueNotification({
					header: 'Error',
					message: 'Entered Username is Banned',
					status: NotificationStatus.ERROR
				});
				errorUsername += 1;
			}
		}
		return errorUsername === 0;
	};

	const handleOptionalUsername = async () => {
		if (optionalUsername && optionalUsername.trim() !== '') {
			// Username is not empty, set user to true
			if (!validateUsername(optionalUsername)) return;
			const { data, error } = await nextApiClientFetch<IAddProfileResponse>('api/v1/auth/actions/addProfile', {
				// username: optionalUsername
				badges: JSON.stringify([]),
				bio: '',
				custom_username: true,
				image: currentUser.picture || '',
				social_links: JSON.stringify([]),
				title: '',
				user_id: Number(currentUser.id),
				username: optionalUsername
			});

			if (error || !data) {
				console.error('Error updating profile: ', error);
				queueNotification({
					header: 'Error!',
					message: error || 'Your profile was not updated.',
					status: NotificationStatus.ERROR
				});
				setLoading(true);
				setShowSuccessModal(true);
				setIsError(true);
			}

			if (data?.token) {
				queueNotification({
					header: 'Success!',
					message: 'Your profile was updated.',
					status: NotificationStatus.SUCCESS
				});
				handleTokenChange(data?.token, { ...userDetailsContext }, dispatch);
				setLoading(true);
				setShowSuccessModal(false);
				setIsError(false);
			}
		} else {
			setIsError(true);
			// Username is empty, handle accordingly
		}
		console.log(currentUser);
	};

	const handleOptionalSkip = () => {
		setLoginOpen?.(false);
	};

	const handleOptionalDetails = async () => {
		// setLoginOpen?.(false);
		if (email && email.trim() !== '' && firstPassword && firstPassword.trim() !== '') {
			console.log(email, firstPassword);
		}
	};

	const handleSubmitAuthCode = async (formData: any) => {
		const { authCode } = formData;
		if (isNaN(authCode)) return;
		setLoading(true);

		const { data, error } = await nextApiClientFetch<IAuthResponse>('api/v1/auth/actions/2fa/validate', {
			auth_code: String(authCode), //use string for if it starts with 0
			login_address: address,
			login_wallet: chosenWallet,
			tfa_token: authResponse.tfa_token,
			user_id: Number(authResponse.user_id)
		});

		if (error || !data) {
			setError(error || 'Login failed. Please try again later.');
			setLoading(false);
			return;
		}

		if (data?.token) {
			setError('');
			handleTokenChange(data.token, currentUser, dispatch);
			if (isModal) {
				setLoading(false);
				setAuthResponse(initAuthResponse);
				setLoginOpen?.(false);
				return;
			}
			router.back();
		}
	};

	const handleToggle = () => setDisplayWeb2();

	const handleBackToLogin = (): void => {
		onWalletUpdate && onWalletUpdate();
	};

	const handleChangeWalletWithPolkasafe = (wallet: string) => {
		setChosenWallet(wallet);
		setAccounts([]);
	};
	useEffect(() => {
		if (withPolkasafe && accounts.length === 0 && chosenWallet !== Wallet.POLKASAFE) {
			getAccounts(chosenWallet)
				.then(() => setFetchAccounts(false))
				.catch((err) => {
					console.error(err);
				})
				.finally(() => setLoading(false));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [accounts.length, chosenWallet, withPolkasafe]);

	return (
		<>
			{!showOptionalFields && (
				<div className='flex items-center'>
					<LoginLogo className='ml-6 mr-2' />
					<h3 className='mt-3 text-xl font-semibold text-bodyBlue'>{withPolkasafe ? <PolkasafeWithIcon /> : 'Login'}</h3>
				</div>
			)}
			{!showOptionalFields && <hr className='text-[#D2D8E0] ' />}
			{!showOptionalFields && (
				<article className='flex flex-col gap-y-3 rounded-md bg-white px-8 py-4 shadow-md'>
					<h3 className='flex flex-col gap-y-2'>
						{!withPolkasafe && (
							<p className='m-0 flex items-center justify-start gap-x-2 p-0'>
								<span className='-ml-2 mt-2 scale-75'>
									<WalletIcon which={chosenWallet} />
								</span>
								<span className='text-xl text-bodyBlue sm:text-xl'>{chosenWallet.charAt(0).toUpperCase() + chosenWallet.slice(1).replace('-', '.')}</span>
							</p>
						)}
						{withPolkasafe && (
							<WalletButtons
								disabled={loading}
								onWalletSelect={handleChangeWalletWithPolkasafe}
								showPolkasafe={false}
								noHeader={true}
								selectedWallet={chosenWallet}
							/>
						)}
					</h3>
					{fetchAccounts ? (
						<div className='-mt-3 flex flex-col items-center justify-center'>
							<p className='m-0 p-0 text-base text-bodyBlue'>
								{withPolkasafe
									? 'To fetch your Multisig details, please select a wallet extension'
									: 'For fetching your addresses, Polkassembly needs access to your wallet extensions. Please authorize this transaction.'}
							</p>
							<Divider
								className='m-0 mt-5 p-0 '
								style={{ borderTop: '1px dashed #D2D8E0' }}
							></Divider>
							<div className='-ml-[300px] mt-4 flex pb-5 font-normal'>
								<label className='text-base text-bodyBlue'>Don&apos;t have an account?</label>
								<div
									onClick={handleClick}
									className='cursor-pointer text-base text-pink_primary'
								>
									&nbsp; Sign Up{' '}
								</div>
							</div>
							<Divider
								className='m-0 mb-4 p-0 '
								style={{ borderTop: '1px solid #E1E6EB' }}
							></Divider>
							<div className='ml-auto flex'>
								<Button
									className='mr-3 flex items-center justify-center rounded-md border border-solid border-pink_primary px-8 py-5 text-lg font-medium leading-none text-[#E5007A] outline-none'
									onClick={() => handleBackToLogin()}
								>
									Go Back
								</Button>
								{!withPolkasafe && (
									<Button
										key='got-it'
										icon={<CheckOutlined />}
										className='flex items-center justify-center rounded-md border border-solid border-pink_primary bg-pink_primary px-8 py-5 text-lg font-medium leading-none text-white outline-none'
										onClick={() => {
											getAccounts(chosenWallet)
												.then(() => {
													setFetchAccounts(false);
												})
												.catch((err) => {
													console.error(err);
												});
										}}
									>
										Got it!
									</Button>
								)}
							</div>
						</div>
					) : (
						<>
							{authResponse.isTFAEnabled ? (
								<TFALoginForm
									onBack={() => {
										setAuthResponse(initAuthResponse);
										setError('');
									}}
									onSubmit={handleSubmitAuthCode}
									error={error || ''}
									loading={loading}
								/>
							) : (
								<AuthForm
									onSubmit={handleLogin}
									className='flex flex-col px-4'
								>
									{extensionNotFound ? (
										<div className='my-5 flex items-center justify-center'>
											<ExtensionNotDetected chosenWallet={chosenWallet} />
										</div>
									) : null}
									{accountsNotFound && (
										<div className='my-5 flex items-center justify-center'>
											<Alert
												message='You need at least one account in Polkadot-js extension to login.'
												description='Please reload this page after adding accounts.'
												type='info'
												showIcon
											/>
										</div>
									)}
									{isAccountLoading ? (
										<div className='my-5'>
											<Loader
												size='large'
												timeout={3000}
												text='Requesting Web3 accounts'
											/>
										</div>
									) : (
										accounts.length > 0 && (
											<>
												<div className='my-5 flex items-center justify-center'>
													{withPolkasafe ? (
														<MultisigAccountSelectionForm
															multisigBalance={multisigBalance}
															setMultisigBalance={setMultisigBalance}
															title='Choose linked account'
															accounts={accounts}
															address={address}
															onAccountChange={onAccountChange}
															walletAddress={multisigAddress}
															setWalletAddress={setMultisigAddress}
														/>
													) : (
														<AccountSelectionForm
															isTruncateUsername={false}
															title='Choose linked account'
															accounts={accounts}
															address={address}
															onAccountChange={onAccountChange}
															linkAddressTextDisabled
														/>
													)}
												</div>
												{isSignUp && (
													<Alert
														showIcon
														className='mb-2'
														type='info'
														message={
															<>
																By Signing up you agree to the terms of the{' '}
																<Link
																	href='/terms-and-conditions'
																	className='text-pink_primary'
																>
																	Polkassembly end user agreement
																</Link>
																.
															</>
														}
													/>
												)}
												<div className='flex items-center justify-center'>
													<Button
														loading={loading}
														disabled={withPolkasafe && !multisigAddress}
														htmlType='submit'
														size='large'
														className='w-[144px] rounded-md border-none bg-pink_primary text-white outline-none'
													>
														Login
													</Button>
												</div>
												<div>
													<Divider style={{ color: '#90A0B7' }}>
														<div className='flex items-center gap-x-2'>
															<span className='text-md text-grey_primary'>Or</span>
															<Button
																className='text-md border-none p-0 font-normal text-pink_primary outline-none'
																disabled={loading}
																onClick={handleToggle}
															>
																Login with Username
															</Button>
														</div>
													</Divider>
												</div>
												<div className='-mt-2 flex justify-center pb-5 font-normal'>
													<label className='text-base text-bodyBlue'>Don&apos;t have an account?</label>
													<div
														onClick={handleClick}
														className='cursor-pointer text-base text-pink_primary'
													>
														&nbsp; Sign Up{' '}
													</div>
												</div>
											</>
										)
									)}
									<div>{error && <FilteredError text={error} />}</div>
								</AuthForm>
							)}
						</>
					)}
				</article>
			)}
			{showOptionalFields && (
				<div>
					{showSuccessModal && (
						<AuthForm onSubmit={handleOptionalUsername}>
							<div>
								<div className='px-8 pb-2 pt-8'>
									<IconConfirmation className='confirm-logo-conatiner text-2xl' />
									<p className='mt-8 justify-center text-center text-xl font-semibold text-bodyBlue'>You are successfully logged in</p>
									<p className='mt-4 justify-center text-center text-sm font-normal text-bodyBlue'>Please add your username to personalise your experience.</p>
									<div className='flex flex-col gap-y-1'>
										<label
											className='text-sm text-lightBlue '
											htmlFor='username'
										>
											Enter Username
											<span className='text-red'>*</span>
										</label>
										<Form.Item
											name='username'
											rules={[
												{
													message: messages.VALIDATION_USERNAME_REQUIRED_ERROR,
													required: username.required
												},
												{
													max: username.maxLength,
													message: messages.VALIDATION_USERNAME_MAXLENGTH_ERROR
												},
												{
													message: messages.VALIDATION_USERNAME_MINLENGTH_ERROR,
													min: username.minLength
												}
											]}
											validateTrigger='onSubmit'
										>
											<Input
												// disabled={loading}
												onChange={(e) => setOptionalUsername(e.target.value)}
												placeholder='Type here'
												className='rounded-md px-4 py-3'
												id='username'
											/>
										</Form.Item>
									</div>
									{!isError && (
										<div
											className='mb-5 mt-1 flex justify-center p-3 text-center'
											style={{ backgroundColor: '#E6F4FF', border: '1px solid #91CAFF', borderRadius: '6px' }}
										>
											<BlueCautionIcon className='-mt-[2px] mr-1 text-2xl' />
											<p className='m-0 p-0 text-sm text-bodyBlue'>You can update your username from the settings page.</p>
										</div>
									)}
									{/* {isError && (
								<div
									className='-mt-1 mb-5 flex justify-center p-3 text-center'
									style={{ backgroundColor: '#FFF1F4', border: '1px solid #FF3C5F', borderRadius: '6px' }}
								>
									<BlueCautionIcon className='-mt-[2px] mr-1 text-2xl' />
									<p className='m-0 p-0 text-sm text-bodyBlue'>Adding a username is a mandatory field.</p>
								</div>
							)} */}
								</div>
								<Divider
									className='-mt-2'
									style={{ borderTop: '1px solid #E1E6EB' }}
								></Divider>
								<div className='mb-6 flex px-8'>
									<Button
										size='large'
										htmlType='submit'
										className='ml-auto w-[144px] rounded-md border-none bg-pink_primary text-white outline-none'
									>
										Next
									</Button>
								</div>
							</div>
						</AuthForm>
					)}
					{!showSuccessModal && (
						<AuthForm onSubmit={handleOptionalDetails}>
							<div>
								<div className='my-4 ml-6 flex'>
									<IconMail className='mr-2 text-2xl' />
									<p className='m-0 p-0 text-xl font-semibold text-bodyBlue'>Add your email</p>
								</div>
								<Divider
									className='-mt-1 mb-5'
									style={{ borderTop: '1px solid #E1E6EB' }}
								></Divider>
								<div className='p-8'>
									<div className='flex flex-col gap-y-1'>
										<label
											htmlFor='email'
											className='text-base tracking-wide text-[#485F7D]'
										>
											Email
										</label>
										<Form.Item
											name='email'
											rules={[
												{
													message: messages.VALIDATION_EMAIL_ERROR,
													pattern: validation.email.pattern
												}
											]}
										>
											<Input
												onChange={(e) => {
													setEmail(e.target.value);
												}}
												placeholder='email@example.com'
												className='rounded-md px-4 py-2'
												id='email'
											/>
										</Form.Item>
									</div>
									<div className='flex flex-col gap-y-1'>
										<label
											className='text-base text-[#485F7D]'
											htmlFor='first_password'
										>
											Set Password
										</label>
										<Form.Item
											name='first_password'
											rules={[
												{
													message: messages.VALIDATION_PASSWORD_ERROR,
													required: password.required
												},
												{
													message: messages.VALIDATION_PASSWORD_ERROR,
													min: password.minLength
												}
											]}
										>
											<Input.Password
												onChange={(e) => {
													setFirstPassword(e.target.value);
												}}
												placeholder='Password'
												className='rounded-md px-4 py-2'
												id='first_password'
											/>
										</Form.Item>
									</div>
									<div className='flex flex-col gap-y-1'>
										<label
											className='text-base text-[#485F7D] '
											htmlFor='second_password'
										>
											Re-enter Password
										</label>
										<Form.Item
											name='second_password'
											rules={[
												{
													message: "Password don't match",
													validator(rule, value, callback) {
														if (callback && value !== firstPassword) {
															callback(rule?.message?.toString());
														} else {
															callback();
														}
													}
												}
											]}
										>
											<Input.Password
												placeholder='Password'
												className='rounded-md px-4 py-2'
												id='second_password'
											/>
										</Form.Item>
									</div>
									<div
										className='mb-5 mt-2 flex justify-center p-3 text-center'
										style={{ backgroundColor: '#E6F4FF', border: '1px solid #91CAFF', borderRadius: '6px' }}
									>
										<BlueCautionIcon className='-mt-[2px] mr-1 text-2xl' />
										<p className='m-0 p-0 text-sm text-bodyBlue'>You can set your email and password later from the settings page.</p>
									</div>
								</div>
								<Divider
									className='-mt-6 mb-5'
									style={{ borderTop: '1px solid #E1E6EB' }}
								></Divider>
								<div className='mb-6 flex justify-end gap-x-5 px-8'>
									<Button
										size='large'
										htmlType='submit'
										className='w-[144px] rounded-md border-none bg-pink_primary text-white outline-none'
									>
										Done
									</Button>
									<Button
										size='large'
										onClick={handleOptionalSkip}
										className='w-[144px] rounded-md border-none bg-pink_primary text-white outline-none'
									>
										Skip
									</Button>
								</div>
							</div>
						</AuthForm>
					)}
				</div>
			)}
		</>
	);
};

const PolkasafeWithIcon = () => (
	<>
		Login by Polkasafe{' '}
		<Image
			width={25}
			height={25}
			src='/assets/polkasafe-logo.svg'
			alt='polkasafe'
		/>
	</>
);

export default Web3Login;

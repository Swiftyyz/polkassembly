// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable sort-keys */
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Cascader, TabsProps } from 'antd';
import { DiscussionsIcon } from '~src/ui-components/CustomIcons';
import { Tabs } from '~src/ui-components/Tabs';
import { useTheme } from 'next-themes';

interface Option {
	value: string;
	label: string;
	children?: Option[];
}

interface ForumLayoutProps {
	children: React.ReactNode;
}

const ForumLayout: React.FC<ForumLayoutProps> = ({ children }) => {
	const router = useRouter();
	const [category, setCategory] = useState<string[] | undefined>(undefined);
	const { resolvedTheme: theme } = useTheme();
	const [activeTab, setActiveTab] = useState('Forum');

	const tabItems: TabsProps['items'] = [
		{
			children: <></>,
			key: 'PADiscussions',
			label: <span className='px-1.5'>Polkassembly</span>
		},
		{
			children: <></>,
			key: 'Forum',
			label: (
				<div className='flex items-center gap-2'>
					Forum<span className='h-5 w-[34px] rounded-[4px] bg-[#407BFF] px-[6px] text-[10px] font-bold text-white'>New</span>
				</div>
			)
		}
	];
	const onTabClick = (key: string) => {
		if (key === 'PADiscussions') {
			router.push('/discussions');
		} else if (key === 'Forum') {
			router.push('/forum');
		} else {
			setActiveTab(key);
		}
	};

	const options: Option[] = [
		{ value: 'latest', label: 'Latest' },
		{ value: 'polkadot-technology', label: 'Tech Talk' },
		{ value: 'ambassador-programme', label: 'Ambassador Programme' },
		{ value: 'governance', label: 'Governance' },
		{
			value: 'ecosystem',
			label: 'Ecosystem',
			children: [
				{ value: 'all', label: 'All' },
				{ value: 'digest', label: 'Digest' }
			]
		},
		{ value: 'uncategorized', label: 'Miscellaneous' },
		{
			value: 'polkadot-forum-meta',
			label: 'Polkadot Forum Meta',
			children: [
				{ value: 'all', label: 'All' },
				{ value: 'profiles', label: 'Profiles' },
				{ value: 'suggestions', label: 'Suggestions' }
			]
		}
	];

	const onChange: any = (value: string[]) => {
		setCategory(value);
		if (!value) return;
		if (value[0] === 'latest') return router.push('/forum');
		if (value.length > 1) {
			const subcategory = value[value.length - 1];
			const category = value[value.length - 2];
			router.push(`/forum/c/${category}/${subcategory}`);
		} else if (value.length == 1) {
			router.push(`/forum/c/${value[0]}`);
		}
	};

	return (
		<>
			<div className='mt-3 flex w-full flex-col justify-between align-middle sm:flex-row'>
				<div className='mx-2 flex text-2xl font-semibold leading-9 text-bodyBlue dark:text-blue-dark-high'>
					<DiscussionsIcon className='text-lg text-lightBlue dark:text-icon-dark-inactive xs:mr-3 sm:mr-2 sm:mt-[2px]' />
					Latest Discussion
				</div>
			</div>
			<div className='mt-3 w-full rounded-xxl bg-white px-4 py-2 shadow-md dark:bg-section-dark-overlay md:px-8 md:py-4'>
				<p className='m-0 mt-2 p-0 text-sm font-medium text-bodyBlue dark:text-blue-dark-high'>
					This is the place to discuss on-chain proposals. On-chain posts are automatically generated as soon as they are created on the chain. Only the proposer is able to edit
					them.
				</p>
			</div>
			<div className='mt-10 flex flex-col rounded-[14px] bg-white shadow-[0px_6px_18px_rgba(0,0,0,0.06)] dark:bg-section-dark-overlay xs:px-0 xs:py-3 md:p-0'>
				<div className=' px-4 xs:py-4 sm:pb-0 sm:pt-6'>
					<Tabs
						theme={theme}
						activeKey={activeTab}
						type='card'
						className=''
						items={tabItems}
						onTabClick={onTabClick}
					/>
				</div>
				<div className='mr-6 flex justify-end'>
					<Cascader
						allowClear
						key={category?.toString() || 'latest'}
						placeholder='All Categories'
						options={options}
						onChange={onChange}
						value={category as string[]}
						popupClassName={`text-blue-light-medium text-[14px] dark:bg-section-dark-overlay dark:border-separatorDark dark:rounded-lg dark:text-white hover:[&>ul>li]:text-pink_primary ${
							theme == 'dark'
								? '[&>ul]:bg-section-dark-garyBackground [&>ul>li]:text-blue-dark-medium [&>ul>.ant-cascader-menu-item-selected]:bg-section-dark-garyBackground [&>ul>.ant-cascader-menu-item-selected]:text-pink_primary hover:[&>ul>li]:bg-section-dark-garyBackground hover:[&>ul>li]:text-pink_secondary'
								: 'text-blue-light-medium'
						} z-[2000]`}
					/>
				</div>
				<div>{children}</div>
			</div>
		</>
	);
};

export default ForumLayout;

// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */

import { ResponsiveBar } from '@nivo/bar';
import { useTheme } from 'next-themes';
import React from 'react';

interface IProps {
	delegationSplitData: { delegated: string | number; index: number; solo: string | number }[];
}

const AnalyticsDelegationSplitGraph = ({ delegationSplitData }: IProps) => {
	const { resolvedTheme: theme } = useTheme();

	const data = delegationSplitData.map((item) => ({
		index: `${item.index}`,
		delegated: item.delegated,
		solo: item.solo
	}));

	const colors: { [key: string]: string } = {
		delegated: '#796EEC',
		solo: '#B6B0FB'
	};

	return (
		<div style={{ height: 400 }}>
			<ResponsiveBar
				data={data}
				keys={['delegated', 'solo']}
				indexBy='index'
				margin={{ bottom: 50, left: 50, right: 10, top: 10 }}
				padding={0.5}
				valueScale={{ type: 'linear' }}
				indexScale={{ type: 'band', round: true }}
				colors={(bar) => colors[bar.id]}
				borderRadius={3}
				borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
				axisTop={null}
				axisRight={null}
				axisBottom={{
					tickPadding: 5,
					tickRotation: 0,
					tickSize: 5,
					truncateTickAt: 0
				}}
				axisLeft={{
					tickSize: 5,
					tickPadding: 5,
					tickRotation: 0,
					legend: 'Value',
					legendPosition: 'middle',
					legendOffset: -40
				}}
				enableLabel={false}
				labelSkipWidth={6}
				labelSkipHeight={12}
				labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
				legends={[
					{
						anchor: 'bottom',
						dataFrom: 'keys',
						direction: 'row',
						effects: [
							{
								on: 'hover',
								style: {
									itemOpacity: 1
								}
							}
						],
						itemDirection: 'left-to-right',
						itemHeight: 20,
						itemOpacity: 0.85,
						itemTextColor: theme === 'dark' ? '#747474' : '#576D8B',
						itemWidth: 100,
						itemsSpacing: 2,
						justify: false,
						symbolShape: 'circle',
						symbolSize: 6,
						translateX: 20,
						translateY: 50
					}
				]}
				role='application'
				theme={{
					axis: {
						domain: {
							line: {
								stroke: theme === 'dark' ? '#3B444F' : '#D2D8E0',
								strokeWidth: 1
							}
						},
						ticks: {
							text: {
								fill: theme === 'dark' ? '#fff' : '#576D8B',
								fontSize: 11,
								outlineColor: 'transparent',
								outlineWidth: 0
							}
						}
					},
					grid: {
						line: {
							stroke: theme === 'dark' ? '#3B444F' : '#D2D8E0',
							strokeDasharray: '2 2',
							strokeWidth: 1
						}
					},
					legends: {
						text: {
							fontSize: 12,
							textTransform: 'capitalize'
						}
					},
					tooltip: {
						container: {
							background: theme === 'dark' ? '#1E2126' : '#fff',
							color: theme === 'dark' ? '#fff' : '#576D8B',
							fontSize: 11,
							textTransform: 'capitalize'
						}
					}
				}}
				ariaLabel='Nivo bar chart demo'
			/>
		</div>
	);
};

export default AnalyticsDelegationSplitGraph;

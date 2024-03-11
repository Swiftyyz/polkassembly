// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Skeleton as AntdSkeleton, SkeletonProps } from 'antd';
import { FC } from 'react';

interface Props extends SkeletonProps {
	className?: string;
}

const Skeleton: FC<Props> = (props) => {
	const { className } = props;
	return (
		<AntdSkeleton
			{...props}
			className={`${className}`}
		/>
	);
};

export default Skeleton;

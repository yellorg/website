import React from 'react';
import { SliceZone } from '@prismicio/react';
import { components } from '../Duckies/Bounty';

interface SliceZoneProps {
    slices: any[];
}

const PrismicSliceZone: React.FC<SliceZoneProps> = ({ slices }: SliceZoneProps) => {
    return <SliceZone slices={slices} components={components} />;
};

export default PrismicSliceZone;

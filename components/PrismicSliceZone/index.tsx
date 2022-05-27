import { SliceZone } from '@prismicio/react';
import { components } from '../../slices';

const PrismicSliceZone = ({ slices }: { slices: any[] }) => (
  <SliceZone slices={slices} components={components} />
)

export default PrismicSliceZone

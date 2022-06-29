const customColors = {
    'main-background-color': '#FFFFFF',
    'subheader-background-color': '#FFFFFF',
    'body-background-color': '#FFFFFF',
    'input-background-color': '#FFFFFF',
    'dropdown-background-color': '#FFFFFF',
    'shadow-color': '#000000',

    'navbar-background-color': '#FFFFFF',
    'footer-background-color': '#FFFFFF',
    'navbar-control-layer-color-10': '#E5D79A',
    'navbar-control-layer-color-20': '#C5B982',
    'navbar-control-layer-color-40': '#988F67',
    'navbar-control-layer-color-60': '#000000',
    'navbar-control-layer-color-80': '#000000',
    'navbar-control-layer-color-90': '#000000',
    'navbar-control-bg-color-10': '#FFFAE3',
    'navbar-control-bg-color-20': '#FFF5C7',
    'navbar-control-bg-color-40': '#FDE057',
    'navbar-control-bg-color-60': '#FCD000',
    'navbar-control-bg-color-80': '#F8C100',
    'navbar-control-bg-color-90': '#ECAA00',

    'text-color-0': '#FFFFFF',
    'text-color-10': '#EBEBEB',
    'text-color-20': '#D3D3D3',
    'text-color-30': '#BDBDBD',
    'text-color-40': '#A6A6A6',
    'text-color-50': '#8E8E8E',
    'text-color-60': '#737373',
    'text-color-70': '#585858',
    'text-color-80': '#3F3F3F',
    'text-color-90': '#272727',
    'text-color-100': '#090909',

    'primary-cta-layer-color-10': '#E5D79A',
    'primary-cta-layer-color-20': '#C5B982',
    'primary-cta-layer-color-40': '#988F67',
    'primary-cta-layer-color-60': '#000000',
    'primary-cta-layer-color-80': '#000000',
    'primary-cta-layer-color-90': '#000000',
    'primary-cta-color-10': '#FFFAE3',
    'primary-cta-color-20': '#FFF5C7',
    'primary-cta-color-40': '#FDE057',
    'primary-cta-color-60': '#FCD000',
    'primary-cta-color-80': '#F8C100',
    'primary-cta-color-90': '#ECAA00',
    'secondary-control-layer-color-10': '#FFFFFF',
    'secondary-control-layer-color-20': '#FFFFFF',
    'secondary-control-layer-color-40': '#FFFFFF',
    'secondary-control-layer-color-60': '#FFFFFF',
    'secondary-control-layer-color-80': '#FFFFFF',
    'secondary-control-layer-color-90': '#FFFFFF',
    'secondary-control-color-10': '#DBEAFE',
    'secondary-control-color-20': '#93C5FD',
    'secondary-control-color-40': '#60A5FA',
    'secondary-control-color-60': '#2563EB',
    'secondary-control-color-80': '#1D4ED8',
    'secondary-control-color-90': '#1E40AF',
    'neutral-control-layer-color-0': '#FFFFFF',
    'neutral-control-layer-color-10': '#DCDCDC',
    'neutral-control-layer-color-20': '#BDBDBD',
    'neutral-control-layer-color-30': '#AAAAAA',
    'neutral-control-layer-color-40': '#8E8E8E',
    'neutral-control-layer-color-50': '#747272',
    'neutral-control-layer-color-60': '#3F3F3F',
    'neutral-control-layer-color-70': '#2C2C2C',
    'neutral-control-layer-color-80': '#000000',
    'neutral-control-layer-color-90': '#000000',
    'neutral-control-layer-color-100': '#000000',
    'neutral-control-color-0': '#FFFFFF',
    'neutral-control-color-10': '#F8F8F8',
    'neutral-control-color-20': '#F4F4F4',
    'neutral-control-color-30': '#F1F1F1',
    'neutral-control-color-40': '#EDEDED',
    'neutral-control-color-50': '#E3E3E3',
    'neutral-control-color-60': '#DCDCDC',
    'neutral-control-color-70': '#CECFD2',
    'neutral-control-color-80': '#C0C2CB',
    'neutral-control-color-90': '#B0B4C2',
    'neutral-control-color-100': '#7F838F',
    'divider-color-10': '#EDEDED',
    'divider-color-20': '#DCDCDC',
    'divider-color-40': '#C2C4CB',
    'divider-color-60': '#A2A6B6',
    'divider-color-80': '#8288A1',
    'divider-color-90': '#5B6488',

    'system-green-10': '#E8FCF1',
    'system-green-20': '#A5E1BF',
    'system-green-40': '#419E6A',
    'system-green-60': '#00632B',
    'system-green-80': '#00401C',
    'system-green-90': '#002611',
    'system-blue-10': '#D3E1FE',
    'system-blue-20': '#7EA5F8',
    'system-blue-40': '#4D82F3',
    'system-blue-60': '#2563EB',
    'system-blue-80': '#0037B3',
    'system-blue-90': '#002987',
    'system-yellow-10': '#FFF5D5',
    'system-yellow-20': '#FFDE81',
    'system-yellow-40': '#EFB008',
    'system-yellow-60': '#976400',
    'system-yellow-80': '#724B00',
    'system-yellow-90': '#4D2900',
    'system-red-10': '#FFE7E7',
    'system-red-20': '#FEA6A6',
    'system-red-40': '#D83232',
    'system-red-60': '#B01212',
    'system-red-80': '#8C0000',
    'system-red-90': '#660000',
    'ask-10': '#FFEBEB',
    'ask-20': '#FC9595',
    'ask-40': '#D83232',
    'ask-60': '#B01212',
    'ask-80': '#8C0000',
    'ask-90': '#660000',
    'bid-10': '#E8FCF1',
    'bid-20': '#A5E1BF',
    'bid-40': '#419E6A',
    'bid-60': '#00632B',
    'bid-80': '#00401C',
    'bid-90': '#002611',
};

const customTypography = {
    'gilmer-medium': [
        'Gilmer-Medium',
        'Geneva',
        'Tahoma',
        'Helvetica',
        'Verdana',
    ],
    'gilmer-bold': ['Gilmer-Bold', 'Geneva', 'Tahoma', 'Helvetica', 'Verdana'],
    'metro-regular': ['MetroSans-Regular', 'Open Sans'],
    'metro-medium': ['MetroSans-Medium', 'Open Sans'],
    'metro-semibold': ['MetroSans-SemiBold', 'Open Sans'],
    'metro-bold': ['MetroSans-Bold', 'Open Sans'],
};

module.exports = {
    content: ['./components/**/*.{ts,tsx}', './pages/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: customColors,
            fontFamily: customTypography,
        },
    },
    plugins: [],
};

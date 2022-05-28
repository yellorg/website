import React from 'react';
import { useRouter } from 'next/router';

interface DuckiesLinkProps {
    token: string;
    redirectToHome: boolean;
}

const DuckiesLink: React.FC<DuckiesLinkProps> = ({ token, redirectToHome }: DuckiesLinkProps) => {
    const router = useRouter();

    React.useEffect(() => {
        if (redirectToHome) {
            router.push('/');
        }

        if (token) {
            localStorage.setItem('referral_token', token);
            router.push('/duckies');
        }
    }, []);

    return null;
};

export const getServerSideProps = async (context: any) => {
    const { params: { token }} = context;

    if (token) {
        return {
            props: {
                token,
                redirectToHome: false,
            }
        };
    }

    return {
        props: {
            redirectToHome: true,
            token: '',
        },
    };
};

export default DuckiesLink;

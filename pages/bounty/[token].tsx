import React from 'react';
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';

interface DuckiesBountyProps {
    token: string;
    redirectToHome: boolean;
}

const DuckiesBounty: React.FC<DuckiesBountyProps> = ({ token, redirectToHome }: DuckiesBountyProps) => {
    const router = useRouter();

    React.useEffect(() => {
        if (redirectToHome) {
            router.replace('/');
        }

        if (token) {
            localStorage.setItem('bounty_token', token);
            router.replace('/duckies');
        }
    }, []);

    return null;
};

export const getServerSideProps = async (context: any) => {
    const jwtPrivateKey = process.env.NEXT_PUBLIC_JWT_PRIVATE_KEY || '';
    const { params: { token }} = context;

    try {
        const verifyJWT = jwt.verify(token, jwtPrivateKey);
        if (verifyJWT) {
            return {
                props: {
                    token,
                    redirectToHome: false,
                },
            };
        }

        return {
            props: {
                redirectToHome: true,
                token: '',
            },
        };
    } catch (error) {
        return {
            props: {
                redirectToHome: true,
                token: '',
            },
        };
    }


};

export default DuckiesBounty;

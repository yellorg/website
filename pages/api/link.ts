import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const generateJWTWithRef = (ref: string) => {
    const jwtPrivateKey = process.env.NEXT_PUBLIC_JWT_PRIVATE_KEY || '';

    const payload = {
        ref,
        amt: 10000,
    };

    const jwtToken = jwt.sign(payload, jwtPrivateKey);

    return jwtToken;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const linkResponse = generateJWTWithRef(req.query.address as string);

    res.status(200).json({ token: linkResponse });
}

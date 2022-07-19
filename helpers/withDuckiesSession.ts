import { NextApiRequest, NextApiResponse } from 'next';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';

export const withDuckiesSession = (handler: (req: NextApiRequest, res: NextApiResponse) => any) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        try {
            req.body = jwt.verify(
                req.body,
                process.env.NEXT_PUBLIC_JWT_PRIVATE_KEY || ''
            );
            await handler(req, res);
        } catch (error) {
            if (error instanceof JsonWebTokenError) {
                return res.status(403).json({ error: 'Access is forbidden' });
            }
        }
    };
};

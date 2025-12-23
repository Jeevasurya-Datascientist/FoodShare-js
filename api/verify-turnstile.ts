import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    const { token } = req.body;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: 'Token is required'
        });
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
        console.error('SERVER ERROR: TURNSTILE_SECRET_KEY is not defined.');
        return res.status(500).json({
            success: false,
            message: 'Server configuration error'
        });
    }

    try {
        const formData = new URLSearchParams();
        formData.append('secret', secretKey);
        formData.append('response', token);
        formData.append('remoteip', req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '');

        const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

        const result = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        const outcome = await result.json();

        if (outcome.success) {
            return res.status(200).json({
                success: true,
                message: 'Token verified successfully',
                // Optional: return hostname or other metadata verified by Cloudflare
            });
        } else {
            console.warn('Turnstile verification failed:', outcome['error-codes']);
            return res.status(403).json({
                success: false,
                message: 'Verification failed',
                errors: outcome['error-codes']
            });
        }

    } catch (error) {
        console.error('Turnstile verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during verification'
        });
    }
}

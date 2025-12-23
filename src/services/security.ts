/**
 * Verifies the Cloudflare Turnstile token with the backend API.
 * @param token The token received from the Turnstile widget.
 * @returns Promise<boolean> True if verification is successful, false otherwise.
 */
export const verifyTurnstileToken = async (token: string): Promise<boolean> => {
    try {
        const response = await fetch('/api/verify-turnstile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('Verification error:', error);
        return false;
    }
};

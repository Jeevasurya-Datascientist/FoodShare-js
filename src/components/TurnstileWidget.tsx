import React, { useEffect, useRef, useState } from 'react';

interface TurnstileWidgetProps {
    siteKey: string;
    onVerify: (token: string) => void;
    onError?: (error: any) => void;
    action?: string;
    theme?: 'light' | 'dark' | 'auto';
}

declare global {
    interface Window {
        turnstile: any;
        onTurnstileLoaded: () => void;
    }
}

const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
    siteKey,
    onVerify,
    onError,
    action,
    theme = 'auto'
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [widgetId, setWidgetId] = useState<string | null>(null);

    useEffect(() => {
        // 1. Check if script is already present
        const scriptId = 'cloudflare-turnstile-script';
        let script = document.getElementById(scriptId);

        const renderWidget = () => {
            if (window.turnstile && containerRef.current && !widgetId) {
                try {
                    const id = window.turnstile.render(containerRef.current, {
                        sitekey: siteKey,
                        action: action,
                        theme: theme,
                        callback: (token: string) => {
                            console.log('Turnstile verified, token generated.');
                            onVerify(token);
                        },
                        'error-callback': (err: any) => {
                            console.error('Turnstile error:', err);
                            if (onError) onError(err);
                        },
                    });
                    setWidgetId(id);
                } catch (e) {
                    console.error("Error rendering Turnstile:", e);
                }
            }
        };

        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);

            script.onload = () => {
                renderWidget();
            };
        } else {
            if (window.turnstile) {
                renderWidget();
            } else {
                // Script exists but maybe not loaded? Wait for it.
                script.addEventListener('load', renderWidget);
            }
        }

        return () => {
            if (widgetId && window.turnstile) {
                try {
                    window.turnstile.remove(widgetId);
                } catch (e) { /* ignore */ }
            }
            // Don't remove the script tag to save bandwidth/time on re-mounts
        };
    }, [siteKey, action, theme]);

    return (
        <div className="w-full flex justify-center my-4">
            <div ref={containerRef} className="min-h-[65px]" />
        </div>
    );
};

export default TurnstileWidget;

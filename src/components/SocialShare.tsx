import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Share2, Linkedin, Facebook, Twitter, Link as LinkIcon, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SocialShareProps {
    title: string;
    text: string;
    url: string;
    variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'hero';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({
    title,
    text,
    url,
    variant = 'outline',
    size = 'default',
    className
}) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const shareData = {
        title,
        text,
        url
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                toast.success("Shared successfully!");
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            setIsOpen(true);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(`${text} ${url}`);
        toast.success("Link copied to clipboard!");
    };

    const shareLinks = [
        {
            name: 'WhatsApp',
            icon: Smartphone,
            color: 'bg-green-500 text-white',
            href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`
        },
        {
            name: 'LinkedIn',
            icon: Linkedin,
            color: 'bg-blue-600 text-white',
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        },
        {
            name: 'Twitter',
            icon: Twitter,
            color: 'bg-sky-500 text-white',
            href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        },
        {
            name: 'Facebook',
            icon: Facebook,
            color: 'bg-blue-700 text-white',
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button
                variant={variant}
                size={size}
                className={cn("gap-2", className)}
                onClick={handleNativeShare}
            >
                <Share2 className="h-4 w-4" />
                {size !== 'icon' && "Share Impact"}
            </Button>

            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Share to Social Media</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    {shareLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-transform hover:scale-105",
                                link.color
                            )}
                        >
                            <link.icon className="h-6 w-6" />
                            <span className="text-sm font-medium">{link.name}</span>
                        </a>
                    ))}
                    <button
                        onClick={copyToClipboard}
                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-secondary text-secondary-foreground transition-transform hover:scale-105 col-span-2 border"
                    >
                        <LinkIcon className="h-6 w-6" />
                        <span className="text-sm font-medium">Copy Link</span>
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SocialShare;

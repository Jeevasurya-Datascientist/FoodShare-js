import React from 'react';
import { Leaf, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    return (
        <footer className="py-12 bg-foreground text-background mt-auto">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <Leaf className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-xl font-display font-bold text-background">FeedReach</span>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
                        <div className="flex gap-6 text-sm font-medium text-background/80 mb-2">
                            <Link to="/guide-appreciation" className='hover:text-primary transition-colors flex items-center gap-1 group'>
                                <Heart className="h-3 w-3 text-red-500 group-hover:fill-red-500 transition-colors" /> Mentorship
                            </Link>
                            <Link to="/terms" className='hover:text-primary transition-colors'>Terms</Link>
                            <Link to="/privacy" className='hover:text-primary transition-colors'>Privacy</Link>
                        </div>
                        <p className="text-background/60 text-sm">
                            © 2026 FeedReach. Reducing food waste, one meal at a time.
                            <br />
                            <span className="text-xs opacity-50 font-mono">Powered by JS Corporations</span>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};
export default Footer;

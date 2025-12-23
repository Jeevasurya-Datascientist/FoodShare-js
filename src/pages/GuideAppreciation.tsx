import React, { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '../components/Footer';
import { Heart, Star, Award, Zap, Code2, Globe, Sparkles, GraduationCap, Crown, Target, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

// Simple Confetti Component
const Confetti = () => {
    const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; rotation: number; speed: number }[]>([]);

    useEffect(() => {
        const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
        const newParticles = Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: -10 - Math.random() * 20,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            speed: 0.5 + Math.random() * 1.5
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute w-2 h-2 rounded-[1px] animate-fall"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        backgroundColor: p.color,
                        transform: `rotate(${p.rotation}deg)`,
                        animation: `confetti-fall ${3 + Math.random() * 2}s linear forwards`,
                        animationDelay: `${Math.random() * 2}s`
                    }}
                />
            ))}
        </div>
    );
};

const GuideAppreciation = () => {
    const [active, setActive] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTimeout(() => setActive(true), 100);
    }, []);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Subtle parallax effect
        const rotateX = ((y - centerY) / centerY) * -2;
        const rotateY = ((x - centerX) / centerX) * 2;

        setMousePosition({ x: rotateY, y: rotateX });
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans selection:bg-yellow-500/30 flex flex-col">
            {/* CSS for animations */}
            <style>{`
            @keyframes confetti-fall {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
            }
            .glass-card {
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
            }
            .text-glow {
                text-shadow: 0 0 20px rgba(253, 224, 71, 0.3);
            }
        `}</style>

            {/* Dark Ambient Background */}
            <div className="absolute inset-0 bg-[#020617]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#020617] to-black opacity-80" />
            <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-purple-500/10 to-transparent blur-3xl" />

            {/* Aurora Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[100px] animate-pulse-slow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[100px] animate-pulse-slow delay-1000" />

            {active && <Confetti />}

            <Navbar />

            <main className="flex-1 relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-center">

                <div
                    ref={containerRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setMousePosition({ x: 0, y: 0 })}
                    className={`w-full max-w-6xl transition-all duration-1000 ease-out transform ${active ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
                    style={{
                        perspective: '1000px',
                    }}
                >
                    <div
                        className="transition-transform duration-200 ease-out"
                        style={{
                            transform: `rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg)`,
                        }}
                    >
                        {/* Header Title */}
                        <div className="text-center mb-16 space-y-4">
                            <Badge variant="outline" className="border-yellow-500/30 text-yellow-500 bg-yellow-500/5 px-4 py-1.5 text-xs tracking-[0.2em] font-bold uppercase backdrop-blur-md">
                                Project Leadership
                            </Badge>
                            <h1 className="text-4xl md:text-6xl font-extrabold font-display tracking-tight text-white drop-shadow-lg">
                                Guidance & Mentorship
                            </h1>
                            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-yellow-500 to-transparent mx-auto opacity-50" />
                        </div>

                        {/* Dual Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">

                            {/* Mentor 1: Mrs. Predeepa */}
                            <Card className="glass-card border-l-4 border-l-purple-500 hover:border-l-purple-400 transition-all duration-300 group hover:-translate-y-2">
                                <CardContent className="p-8 text-center">
                                    <div className="mb-6 inline-flex p-4 rounded-full bg-purple-500/10 ring-1 ring-purple-500/30 group-hover:bg-purple-500/20 transition-colors">
                                        <Crown className="h-10 w-10 text-purple-400" />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Mrs. M. Predeepa</h2>
                                    <p className="text-purple-300 font-mono text-sm mb-4">M.E.</p>
                                    <Badge className="bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 border-purple-500/30 mb-6">
                                        Esteemed Guide & Mentor
                                    </Badge>
                                    <p className="text-slate-400 italic text-sm leading-relaxed">
                                        "The visionary who helped us navigate complexities and inspired us to strive for excellence."
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Mentor 2: Mr. Ashok Kumar */}
                            <Card className="glass-card border-l-4 border-l-emerald-500 hover:border-l-emerald-400 transition-all duration-300 group hover:-translate-y-2">
                                <CardContent className="p-8 text-center">
                                    <div className="mb-6 inline-flex p-4 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30 group-hover:bg-emerald-500/20 transition-colors">
                                        <Target className="h-10 w-10 text-emerald-400" />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Mr. Ashok Kumar</h2>
                                    <p className="text-emerald-300 font-mono text-sm mb-4">B.E.</p>
                                    <Badge className="bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 border-emerald-500/30 mb-6">
                                        Project Incharge
                                    </Badge>
                                    <p className="text-slate-400 italic text-sm leading-relaxed">
                                        "The pillar of support who ensured our project remained on track with technical precision."
                                    </p>
                                </CardContent>
                            </Card>

                        </div>

                        {/* Common Gratitude Section */}
                        <div className="glass-card rounded-3xl p-8 md:p-12 text-center max-w-4xl mx-auto relative overflow-hidden">
                            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                            <div className="flex justify-center mb-6">
                                <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
                            </div>

                            <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed mb-8">
                                Your combined guidance has been instrumental in the development of
                                <span className="text-white font-bold px-2">FeedReach [Food Waste Management System].</span>
                                Thank you for fostering an environment of learning and innovation.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-2xl mx-auto">
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Code2 className="h-5 w-5 text-blue-400" />
                                    <span className="text-sm">Technical Support</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                                    <span className="text-sm">Innovative Ideas</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Globe className="h-5 w-5 text-emerald-400" />
                                    <span className="text-sm">Social Impact</span>
                                </div>
                            </div>

                            <div className="mt-12 pt-8 border-t border-white/5">
                                <div className="flex flex-col items-center gap-2">
                                    <p className="text-xs text-slate-500 uppercase tracking-widest">Presented By</p>
                                    <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                                        The Development Team
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/5">
                                        <GraduationCap className="h-3 w-3 text-yellow-500" />
                                        <span className="text-xs text-slate-400 font-mono">
                                            Powered by <span className="text-white font-semibold">JS Corp</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex justify-center pb-8">
                            <Button variant="ghost" className="text-slate-500 hover:text-white rounded-full" asChild>
                                <Link to="/">Back to Home</Link>
                            </Button>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default GuideAppreciation;

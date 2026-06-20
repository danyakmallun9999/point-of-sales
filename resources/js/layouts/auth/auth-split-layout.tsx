import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-zinc-900" />
                <Link href={home()} className="relative z-20 flex items-center text-lg font-medium">
                    Point of Sales System
                </Link> 

                <div className="relative z-10 flex flex-1 items-center justify-center">
                    {/* Komponen Animasi Dipanggil Di Sini */}
                    <POSAnimation />
                </div>

                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;The seamless integration between sales and real-time inventory has saved us hours of manual work every week. It&rsquo;s the smartest investment we&rsquo;ve made for our business.&rdquo;
                        </p>
                        <footer className="text-sm">danyakmallun</footer>
                    </blockquote>
                </div>
            </div>
            <div className="w-full lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Link href={home()} className="relative z-20 flex items-center justify-center lg:hidden">
                        <AppLogoIcon className="h-10 fill-current text-black sm:h-12" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">{description}</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}

function POSAnimation() {
    return (
        <div className="relative w-full max-w-[500px] aspect-4/3 flex items-center justify-center">
            <style>
                {`
                :root {
                    --pos-slate-900: #0F172A;
                    --pos-slate-800: #1E293B;
                    --pos-slate-700: #334155;
                    --pos-slate-600: #475569;
                    --pos-slate-500: #64748B;
                    --pos-slate-400: #94A3B8;
                    --pos-slate-300: #CBD5E1;
                    --pos-mint-600: #059669;
                    --pos-mint-500: #10B981;
                    --pos-mint-400: #34D399;
                    --pos-gold: #FBBF24;
                    --pos-paper: #F8F9FA;
                    --pos-white: #FFFFFF;
                }

                .animate-card-seq {
                    transform-origin: 0 0;
                    animation: card-sequence 6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }

                @keyframes card-sequence {
                    0% { transform: translate(-10px, 45px); opacity: 0; }
                    10% { transform: translate(-10px, 45px); opacity: 1; }
                    20% { transform: translate(-10px, 15px); opacity: 1; }
                    40% { transform: translate(70px, 15px); opacity: 1; }
                    50% { transform: translate(70px, 45px); opacity: 0; }
                    100% { transform: translate(70px, 45px); opacity: 0; }
                }

                .animate-paper-roll {
                    animation: paper-roll 6s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
                }

                @keyframes paper-roll {
                    0%, 40% { transform: translateY(-50px); opacity: 1; }
                    60%, 85% { transform: translateY(0px); opacity: 1; }
                    92%, 100% { transform: translateY(0px); opacity: 0; }
                }

                .animate-stamp-pop {
                    transform-origin: 15px 15px;
                    animation: stamp-pop 6s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite;
                }

                @keyframes stamp-pop {
                    0%, 60% { transform: scale(0); opacity: 0; }
                    65% { transform: scale(1.1); opacity: 1; }
                    70%, 85% { transform: scale(1); opacity: 1; }
                    92%, 100% { transform: scale(1); opacity: 0; }
                }

                .animate-chip-glow {
                    animation: pulse-glow 6s ease-in-out infinite;
                }

                @keyframes pulse-glow {
                    0%, 20% { opacity: 0.5; filter: drop-shadow(0 0 2px var(--pos-gold)); }
                    30%, 40% { opacity: 1; filter: drop-shadow(0 0 6px var(--pos-white)); }
                    50%, 100% { opacity: 0.5; filter: drop-shadow(0 0 2px var(--pos-gold)); }
                }

                .animate-screen-pulse {
                    animation: screen-pulse 6s infinite;
                }

                @keyframes screen-pulse {
                    0%, 40% { fill: var(--pos-slate-600); }
                    45%, 85% { fill: var(--pos-mint-400); filter: drop-shadow(0 0 4px var(--pos-mint-400)); }
                    90%, 100% { fill: var(--pos-slate-600); }
                }
                `}
            </style>

            <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
                <defs>
                    <linearGradient id="card-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--pos-mint-400)" />
                        <stop offset="100%" stopColor="var(--pos-mint-600)" />
                    </linearGradient>

                    <clipPath id="slit-clip">
                        <polygon points="300,0 600,0 600,180 470,192.5 390,152.5 300,100" />
                    </clipPath>

                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="15" stdDeviation="15" floodColor="#0F172A" floodOpacity="0.2" />
                    </filter>
                </defs>

                {/* 1. BASE SHADOW */}
                <polygon points="400,215 540,285 340,385 200,315" fill="#CBD5E1" filter="url(#shadow)" opacity="0.1" />

                {/* 2. LEFT & FRONT FACES */}
                <polygon points="400,200 200,300 200,280 320,180 400,120" fill="var(--pos-slate-600)" />
                <polygon points="200,300 320,360 320,340 200,280" fill="var(--pos-slate-800)" />

                {/* 3. INNER SLOT WALL */}
                <polygon points="520,260 320,360 320,340 440,240 520,180" fill="var(--pos-slate-900)" />

                {/* 4. TOP SURFACES */}
                <polygon points="320,180 200,280 320,340 440,240" fill="var(--pos-slate-500)" />
                <polygon points="400,120 320,180 440,240 520,180" fill="var(--pos-slate-400)" />

                {/* 5. SCREEN CONTENT */}
                <g transform="matrix(2, 1, -2, 1.5, 400, 120)">
                    <rect x="5" y="20" width="50" height="15" rx="1.5" fill="var(--pos-slate-900)" />
                    <rect x="7" y="22" width="46" height="11" rx="0.5" fill="var(--pos-slate-800)" />
                    <circle cx="12" cy="27.5" r="1.5" className="animate-screen-pulse" />
                    <line x1="16" y1="26" x2="30" y2="26" stroke="var(--pos-slate-600)" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="16" y1="29" x2="40" y2="29" stroke="var(--pos-slate-700)" strokeWidth="1.5" strokeLinecap="round" />
                    <rect x="10" y="15" width="40" height="1.5" fill="var(--pos-slate-900)" />
                </g>

                {/* 6. KEYPAD CONTENT */}
                <g transform="matrix(2, 1, -2, 1.6666, 320, 180)">
                    {/* Row 1 */}
                    <rect x="6" y="6" width="12" height="10" rx="2" fill="var(--pos-slate-400)" />
                    <rect x="24" y="6" width="12" height="10" rx="2" fill="var(--pos-slate-400)" />
                    <rect x="42" y="6" width="12" height="10" rx="2" fill="var(--pos-slate-400)" />
                    {/* Row 2 */}
                    <rect x="6" y="20" width="12" height="10" rx="2" fill="var(--pos-slate-400)" />
                    <rect x="24" y="20" width="12" height="10" rx="2" fill="var(--pos-slate-400)" />
                    <rect x="42" y="20" width="12" height="10" rx="2" fill="var(--pos-slate-400)" />
                    {/* Row 3 */}
                    <rect x="6" y="34" width="12" height="10" rx="2" fill="var(--pos-slate-400)" />
                    <rect x="24" y="34" width="12" height="10" rx="2" fill="var(--pos-slate-400)" />
                    <rect x="42" y="34" width="12" height="10" rx="2" fill="var(--pos-slate-400)" />
                    {/* Row 4 */}
                    <rect x="6" y="48" width="12" height="10" rx="2" fill="var(--pos-slate-400)" />
                    <rect x="24" y="48" width="30" height="10" rx="2" fill="var(--pos-mint-500)" />
                </g>

                {/* Edge Highlights */}
                <polyline points="200,300 320,360 440,240" fill="none" stroke="var(--pos-white)" strokeWidth="1.5" strokeOpacity="0.15" />
                <line x1="320" y1="360" x2="320" y2="340" stroke="var(--pos-white)" strokeWidth="1.5" strokeOpacity="0.15" />

                {/* 7. PAPER RECEIPT */}
                <g clipPath="url(#slit-clip)">
                    <g transform="matrix(2, 1, 0, -2, 398, 159)">
                        <g className="animate-paper-roll">
                            <rect x="0" y="0" width="30" height="50" fill="var(--pos-paper)" />
                            <rect x="5" y="44" width="20" height="3" rx="1" fill="var(--pos-slate-800)" />
                            <line x1="2" y1="40" x2="28" y2="40" stroke="var(--pos-slate-400)" strokeDasharray="2 1" strokeWidth="0.5" />
                            <rect x="4" y="35" width="22" height="1.5" fill="var(--pos-slate-300)" />
                            <rect x="4" y="32" width="18" height="1.5" fill="var(--pos-slate-300)" />
                            <rect x="4" y="29" width="10" height="1.5" fill="var(--pos-slate-300)" />
                            <rect x="20" y="29" width="6" height="1.5" fill="var(--pos-slate-800)" />
                            <line x1="4" y1="26" x2="26" y2="26" stroke="var(--pos-slate-300)" strokeWidth="0.5" />
                            <rect x="4" y="23" width="14" height="1.5" fill="var(--pos-slate-300)" />
                            <rect x="4" y="20" width="16" height="1.5" fill="var(--pos-slate-300)" />

                            <g className="animate-stamp-pop">
                                <circle cx="15" cy="11" r="7" fill="var(--pos-mint-500)" />
                                <path d="M11 11.5 L13.5 14 L19 8.5" fill="none" stroke="var(--pos-white)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                        </g>
                    </g>
                </g>

                {/* 8. THE BANK CARD */}
                <g transform="matrix(-2, 1, 0, -2, 530, 265)">
                    <g className="animate-card-seq">
                        <rect x="0" y="0" width="45" height="28" rx="2" fill="url(#card-grad)" />
                        <rect x="0" y="5" width="45" height="5" fill="var(--pos-slate-900)" />
                        <rect x="6" y="16" width="9" height="7" rx="1" fill="var(--pos-gold)" className="animate-chip-glow" />
                        <line x1="8" y1="18" x2="13" y2="18" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
                        <line x1="8" y1="21" x2="13" y2="21" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
                        <circle cx="38" cy="20" r="3" fill="var(--pos-white)" opacity="0.8" />
                        <circle cx="34" cy="20" r="3" fill="var(--pos-white)" opacity="0.5" />
                    </g>
                </g>

                {/* 9. OUTER WALL OF SLOT */}
                <polygon points="500,290 340,370 340,350 460,250 500,220" fill="var(--pos-slate-800)" />
                <polygon points="480,210 500,220 460,250 440,240" fill="var(--pos-slate-600)" />
                <polygon points="440,240 460,250 340,350 320,340" fill="var(--pos-slate-600)" />
                <polygon points="480,210 500,220 500,290 480,280" fill="var(--pos-slate-700)" />
                <polyline points="480,210 500,220 340,350 340,370" fill="none" stroke="var(--pos-white)" strokeWidth="1.5" strokeOpacity="0.1" />
            </svg>
        </div>
    );
}
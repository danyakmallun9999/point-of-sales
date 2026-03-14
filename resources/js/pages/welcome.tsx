import { Head, Link, usePage } from '@inertiajs/react';
import { Store, ArrowRight } from 'lucide-react';
import { dashboard, login } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Point of Sales Terminal" />
            
            <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
                <main className="flex flex-1 flex-col items-center justify-center px-6">
                    <div className="w-full max-w-sm space-y-10">
                        {/* Branding & Typography */}
                        <div className="flex flex-col items-center space-y-5 text-center">
                            <div className="flex h-16 w-16 items-center justify-center border-2 border-primary bg-transparent text-primary transition-colors">
                                <Store className="h-8 w-8 stroke-[1.5]" />
                            </div>
                            
                            <div className="space-y-1.5">
                                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                    KasirKu Terminal
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Enterprise Point of Sales System
                                </p>
                            </div>
                        </div>

                        {/* Actions / Auth */}
                        <div className="flex flex-col space-y-3">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="group flex h-12 w-full items-center justify-between border border-primary bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-transparent hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                                >
                                    <span>Access Terminal</span>
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            ) : (
                                <Link
                                    href={login()}
                                    className="group flex h-12 w-full items-center justify-between border border-primary bg-primary px-6 text-sm font-medium text-primary-foreground transition-all hover:bg-transparent hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                                >
                                    <span>System Authentication</span>
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            )}
                        </div>
                    </div>
                </main>

                {/* Footer Minimalist */}
                <footer className="border-t border-border/50 py-6 text-center">
                    <p className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                        &copy; {new Date().getFullYear()} System Core v1.0.0
                    </p>
                </footer>
            </div>
        </>
    );
}
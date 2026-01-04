import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LawyerProfile } from '@/types/lawyer';
import { site as siteApi } from '@/lib/api';
import { Check, X, Loader2, Globe, CheckCircle2 } from 'lucide-react';

interface SubdomainSelectionStepProps {
    profile: LawyerProfile;
    onUpdate: (fields: Partial<LawyerProfile['subdomainSelection']>) => void;
}

export function SubdomainSelectionStep({ profile, onUpdate }: SubdomainSelectionStepProps) {
    const { subdomainSelection } = profile;
    const subdomain = subdomainSelection?.subdomain || '';
    const [isValidating, setIsValidating] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!subdomain || subdomain.length < 3) {
            setIsAvailable(null);
            setIsValidating(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsValidating(true);
            setError(null);
            try {
                await siteApi.checkSlug(subdomain);
                setIsAvailable(true);
            } catch (err: any) {
                if (err.response?.status === 400) {
                    setIsAvailable(false);
                } else {
                    console.error('Failed to check subdomain availability:', err);
                    setError('Failed to verify subdomain. Please try again.');
                    setIsAvailable(null);
                }
            } finally {
                setIsValidating(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [subdomain]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        onUpdate({ subdomain: value });
        setIsAvailable(null);
        if (value.length >= 3) {
            setIsValidating(true);
        } else {
            setIsValidating(false);
            setIsAvailable(null);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
                <h2 className="heading-section text-foreground">Choose Your Subdomain</h2>
                <p className="text-muted-foreground">This will be your personal web address where clients can find you.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="subdomain">Subdomain Name *</Label>
                    <div className="relative group">
                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-colors ${isAvailable === true ? 'text-green-500' : 'group-focus-within:text-primary'}`}>
                            <Globe className="w-4 h-4" />
                        </div>
                        <Input
                            id="subdomain"
                            placeholder="e.g., john-smith"
                            value={subdomain}
                            onChange={handleChange}
                            className={`h-12 pl-11 pr-12 font-medium transition-all ${isAvailable === true ? 'border-green-500 bg-green-50/30' : ''}`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            {isValidating ? (
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            ) : isAvailable === true ? (
                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-500 shadow-md shadow-green-200 animate-in zoom-in duration-500">
                                    <Check className="w-4 h-4 text-white stroke-[3px]" />
                                </div>
                            ) : isAvailable === false ? (
                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-destructive shadow-md shadow-red-200 animate-in zoom-in duration-500">
                                    <X className="w-4 h-4 text-white stroke-[3px]" />
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <span>Your site will be:</span>
                            <span className={`lowercase transition-all px-2 py-0.5 rounded-md ${isAvailable === true ? 'bg-green-100 text-green-700 font-bold' : 'text-primary bg-primary/5'}`}>
                                {subdomain || 'your-name'}.{import.meta.env.VITE_PUBLISH_LIVE_DOMAIN || 'wokil.com'}
                            </span>
                            {isAvailable === true && <Check className="w-3.5 h-3.5 text-green-600 animate-in fade-in slide-in-from-left-2" />}
                        </p>

                        {isAvailable === false && (
                            <p className="text-xs font-semibold text-destructive flex items-center gap-1.5 animate-in slide-in-from-top-1">
                                <X className="w-3 h-3" />
                                This subdomain is already taken.
                            </p>
                        )}
                        {isAvailable === true && (
                            <p className="text-xs font-semibold text-green-600 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Great choice! This subdomain is available.
                            </p>
                        )}
                        {error && (
                            <p className="text-xs font-semibold text-destructive">
                                {error}
                            </p>
                        )}
                        {subdomain && subdomain.length < 3 && (
                            <p className="text-xs font-medium text-amber-600">
                                Subdomain must be at least 3 characters long.
                            </p>
                        )}
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Tips for your subdomain:</h4>
                    <ul className="space-y-2">
                        {[
                            "Use your full name or law firm name",
                            "Keep it short and professional",
                            "Only use letters, numbers, and hyphens",
                            "Avoid special characters or spaces"
                        ].map((tip, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-primary/40" />
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

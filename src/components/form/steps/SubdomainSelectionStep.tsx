import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LawyerProfile } from '@/types/lawyer';
import { checkDomainAvailability } from '@/generated/wokil-api';
import { Check, X, Loader2, Globe, CheckCircle2, Shield } from 'lucide-react';

interface SubdomainSelectionStepProps {
    // Structural rather than the whole LawyerProfile, so the firm wizard shares
    // this step. deploymentURL is where "a site is already live" is recorded -
    // lawyers keep it on professionalProfile, firms on firmProfile - and once
    // it is set the address is locked either way.
    profile: {
        subdomainSelection: LawyerProfile['subdomainSelection'];
        professionalProfile?: { deploymentURL?: string };
        firmProfile?: { deploymentURL?: string };
    };
    onUpdate: (fields: Partial<LawyerProfile['subdomainSelection']>) => void;
}

export function SubdomainSelectionStep({ profile, onUpdate }: SubdomainSelectionStepProps) {
    const { subdomainSelection } = profile;
    const subdomain = subdomainSelection?.subdomain || '';
    const [isValidating, setIsValidating] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const isDeployed = !!(profile.professionalProfile?.deploymentURL || profile.firmProfile?.deploymentURL);

    useEffect(() => {
        if (isDeployed || !subdomain || subdomain.length < 3) {
            setIsAvailable(null);
            setIsValidating(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsValidating(true);
            setError(null);
            try {
                // 200 → available, 400 → taken (see checkDomainAvailability spec).
                const { response } = await checkDomainAvailability({ body: { subDomain: subdomain } });
                if (response?.status === 200) {
                    setIsAvailable(true);
                } else if (response?.status === 400) {
                    setIsAvailable(false);
                } else {
                    setError('Failed to verify subdomain. Please try again.');
                    setIsAvailable(null);
                }
            } catch (err) {
                console.error('Failed to check subdomain availability:', err);
                setError('Failed to verify subdomain. Please try again.');
                setIsAvailable(null);
            } finally {
                setIsValidating(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [subdomain, isDeployed]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isDeployed) return;
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
                    <div className="flex items-center justify-between">
                        <Label htmlFor="subdomain">Subdomain Name *</Label>
                        {isDeployed && (
                            <span className="label-caps text-[10px] text-accent-foreground bg-accent/10 px-2 py-0.5 rounded-full border border-accent/30">
                                Locked after deployment
                            </span>
                        )}
                    </div>
                    <div className="relative group">
                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-colors ${isAvailable === true ? 'text-success' : 'group-focus-within:text-accent'}`}>
                            <Globe className="w-4 h-4" />
                        </div>
                        <Input
                            id="subdomain"
                            placeholder="e.g., john-smith"
                            value={subdomain}
                            onChange={handleChange}
                            disabled={isDeployed}
                            className={`h-12 pl-11 pr-12 font-medium transition-all ${isAvailable === true ? 'border-success bg-success/5' : ''} ${isDeployed ? 'bg-muted/50 border-dashed cursor-not-allowed opacity-80' : ''}`}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            {isValidating ? (
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            ) : isAvailable === true ? (
                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-success shadow-sm animate-in zoom-in duration-500">
                                    <Check className="w-4 h-4 text-success-foreground stroke-[3px]" />
                                </div>
                            ) : isAvailable === false ? (
                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-destructive shadow-sm animate-in zoom-in duration-500">
                                    <X className="w-4 h-4 text-destructive-foreground stroke-[3px]" />
                                </div>
                            ) : isDeployed ? (
                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10">
                                    <CheckCircle2 className="w-4 h-4 text-primary" />
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-1">
                        <p className="text-[10px] label-caps text-muted-foreground flex items-center gap-2">
                            <span>Your site is:</span>
                            <span className={`lowercase transition-all px-2 py-0.5 rounded-md ${isDeployed || isAvailable === true ? 'bg-success/12 text-success font-bold' : 'text-primary bg-primary/5'}`}>
                                {subdomain || 'your-name'}.{process.env.NEXT_PUBLIC_PUBLISH_LIVE_DOMAIN || 'wokil.com'}
                            </span>
                            {(isDeployed || isAvailable === true) && <Check className="w-3.5 h-3.5 text-success animate-in fade-in slide-in-from-left-2" />}
                        </p>

                        {!isDeployed && isAvailable === false && (
                            <p className="text-xs font-semibold text-destructive flex items-center gap-1.5 animate-in slide-in-from-top-1">
                                <X className="w-3 h-3" />
                                This subdomain is already taken.
                            </p>
                        )}
                        {!isDeployed && isAvailable === true && (
                            <p className="text-xs font-semibold text-success flex items-center gap-1.5 animate-in slide-in-from-top-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Great choice! This subdomain is available.
                            </p>
                        )}
                        {isDeployed && (
                            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5 text-primary" />
                                This address is locked to your professional profile.
                            </p>
                        )}
                        {error && (
                            <p className="text-xs font-semibold text-destructive">
                                {error}
                            </p>
                        )}
                        {!isDeployed && subdomain && subdomain.length < 3 && (
                            <p className="text-xs font-medium text-accent-foreground">
                                Subdomain must be at least 3 characters long.
                            </p>
                        )}
                    </div>
                </div>

                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-3">
                    <h4 className="text-xs label-caps text-primary">Tips for your subdomain:</h4>
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

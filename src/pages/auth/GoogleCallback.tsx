import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function GoogleCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const code = searchParams.get('code');

        if (!code) {
            toast({
                title: "Authentication Error",
                description: "No authentication code received from Google.",
                variant: "destructive",
            });
            navigate('/');
            return;
        }

        const handleCallback = async () => {
            try {
                const data = await auth.handleCallback(code);
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    toast({
                        title: "Successfully Logged In",
                        description: "Welcome to Wokil!",
                    });
                    // Redirect to where they were or dashboard
                    navigate('/dashboard');
                } else {
                    throw new Error("No token received");
                }
            } catch (error) {
                console.error('Login error:', error);
                toast({
                    title: "Login Failed",
                    description: "There was a problem logging you in with Google.",
                    variant: "destructive",
                });
                navigate('/');
            } finally {
                setIsProcessing(false);
            }
        };

        handleCallback();
    }, [searchParams, navigate, toast]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                <h2 className="text-xl font-heading font-medium">Authenticating...</h2>
                <p className="text-muted-foreground">Please wait while we verify your credentials.</p>
            </div>
        </div>
    );
}

import { Settings as SettingsIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-10 max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <SettingsIcon className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground mb-4">
            Settings
          </h1>
          <p className="text-muted-foreground text-lg max-w-md">
            This feature is coming soon. You'll be able to manage your account settings and preferences here.
          </p>
        </div>
      </main>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LawyerProfile } from '@/types/lawyer';
import { ProfilePreview } from '@/components/preview/ProfilePreview';
import { Button } from '@/components/ui/button';
import { Scale, Home } from 'lucide-react';

export default function PublicProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<LawyerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      const profiles = JSON.parse(localStorage.getItem('lawyerProfiles') || '{}');
      const foundProfile = profiles[slug];
      
      if (foundProfile) {
        setProfile(foundProfile);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <Scale className="w-12 h-12 text-primary" />
        </div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Scale className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="heading-section text-foreground mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The lawyer profile you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/">
            <Button className="gap-2">
              <Home className="w-4 h-4" />
              Create Your Profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <ProfilePreview profile={profile} />;
}

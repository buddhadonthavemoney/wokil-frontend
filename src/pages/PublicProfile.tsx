import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { LawyerProfile } from '@/types/lawyer';
import { ProfilePreview } from '@/components/preview/ProfilePreview';
import { QRCodeCard } from '@/components/preview/QRCodeCard';
import { Button } from '@/components/ui/button';
import { Scale, Home } from 'lucide-react';
import { InfoModal } from '@/components/InfoModal';
import { profile as profileApi } from '@/lib/api';

export default function PublicProfile() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [profile, setProfile] = useState<LawyerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    description: '',
    type: 'info' as 'info' | 'success' | 'error',
  });

  useEffect(() => {
    // Check for navigation state to show modal
    if (location.state?.showInfoModal) {
      setShowInfoModal(true);
      setModalContent({
        title: location.state.modalTitle || 'Info',
        description: location.state.modalDescription || '',
        type: location.state.modalType || 'info',
      });
      // Clear the state so it doesn't persist on reload (conceptually, though react router state persists)
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (slug) {
        try {
          const data = await profileApi.getPublic(slug);
          if (data) {
            setProfile(data);
          } else {
            setNotFound(true);
          }
        } catch (error) {
          console.error("Failed to fetch public profile:", error);
          setNotFound(true);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfile();
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

  return (
    <>
      <ProfilePreview profile={profile} />

      {/* QR Code Overlay */}
      <div className="fixed bottom-6 right-6 z-40">
        <QRCodeCard profile={profile} />
      </div>

      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title={modalContent.title}
        description={modalContent.description}
        type={modalContent.type}
        actionLabel="View Profile"
      />
    </>
  );
}

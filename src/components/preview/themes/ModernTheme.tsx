import { LawyerProfile } from '@/types/lawyer';
import { Hero } from './modern/Hero';
import { About } from './modern/About';
import { PracticeAreas } from './modern/PracticeAreas';
import { ContactGrid } from './modern/ContactGrid';
import { OnlineLinks } from './modern/OnlineLinks';
import { Footer } from './modern/Footer';

interface ModernThemeProps {
  profile: LawyerProfile;
}

// Composed from src/components/preview/themes/modern/* — split into sections
// (rather than one monolithic component) so Epic 5's GrapesJS block library
// can map directly onto them instead of starting from scratch.
export function ModernTheme({ profile }: ModernThemeProps) {
  const {
    basicInformation,
    practiceDetails,
    contactInformation,
    professionalProfile,
    onlinePresence
  } = profile;

  const fullName = basicInformation.fullName || 'Your Name';
  const professionalTitle = basicInformation.professionalTitle || 'Legal Professional';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-body selection:bg-blue-500/30">
      <Hero
        fullName={fullName}
        professionalTitle={professionalTitle}
        lawFirmName={basicInformation.lawFirmName}
        yearsOfExperience={basicInformation.yearsOfExperience}
        phoneNumber={contactInformation.phoneNumber}
        email={contactInformation.email}
        profilePhoto={professionalProfile.profilePhoto}
      />

      <main className="container mx-auto px-6 py-24">
        <About bio={professionalProfile.bio} />
        <PracticeAreas areas={practiceDetails.areasOfPractice || []} />
        <ContactGrid
          phoneNumber={contactInformation.phoneNumber}
          email={contactInformation.email}
          officeAddress={contactInformation.officeAddress}
          officeHours={professionalProfile.officeHours}
        />
        <OnlineLinks website={onlinePresence.website} linkedIn={onlinePresence.linkedIn} />
      </main>

      <Footer fullName={fullName} />
    </div>
  );
}

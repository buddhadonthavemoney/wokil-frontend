import { LawyerProfile } from '@/types/lawyer';

interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'Person' | 'ProfilePage';
  data?: any;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case 'Organization':
        return {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Wokil',
          description: 'A website builder and host for lawyers. Create professional profiles, business cards, and websites for legal professionals.',
          url: process.env.NEXT_PUBLIC_SITE_URL || 'https://wokil.com',
          logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://wokil.com'}/placeholder.svg`,
          sameAs: [
            // Add social media links when available
            // 'https://twitter.com/Wokil',
            // 'https://linkedin.com/company/Wokil',
          ],
        };
      
      case 'WebSite':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Wokil',
          url: process.env.NEXT_PUBLIC_SITE_URL || 'https://wokil.com',
          description: 'A website builder and host for lawyers. Create professional profiles, business cards, and websites for legal professionals.',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://wokil.com'}/professionals?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        };
      
      case 'Person':
        if (!data) return null;
        const profile: LawyerProfile = data;
        const basicInfo = profile.basicInformation;
        const contact = profile.contactInformation;
        const professional = profile.professionalProfile;
        const onlinePresence = profile.onlinePresence;
        
        return {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: basicInfo.fullName,
          jobTitle: basicInfo.professionalTitle,
          description: professional.bio,
          image: professional.profilePhoto,
          url: onlinePresence?.website || profile.siteUrl || professional.deploymentURL,
          email: contact.email,
          telephone: contact.phoneNumber,
          address: {
            '@type': 'PostalAddress',
            streetAddress: contact.officeAddress,
          },
          sameAs: [
            onlinePresence?.linkedIn,
            onlinePresence?.website,
          ].filter(Boolean),
        };
      
      case 'ProfilePage':
        if (!data) return null;
        const profilePage: LawyerProfile = data;
        const basicInfoPage = profilePage.basicInformation;
        
        return {
          '@context': 'https://schema.org',
          '@type': 'ProfilePage',
          mainEntity: {
            '@type': 'Person',
            name: basicInfoPage.fullName,
            jobTitle: basicInfoPage.professionalTitle,
          },
        };
      
      default:
        return null;
    }
  };

  const structuredData = getStructuredData();
  
  if (!structuredData) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

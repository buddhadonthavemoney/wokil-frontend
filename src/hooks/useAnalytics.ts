import { useState, useEffect } from 'react';
import { LawyerProfile } from '@/types/lawyer';

export interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  qrScans: number;
  contactClicks: number;
  viewsThisWeek: number[];
  viewsThisMonth: number;
  topReferrers: { source: string; visits: number }[];
}

const generateMockAnalytics = (profile: LawyerProfile): AnalyticsData => {
  const publishedDays = profile.publishedAt 
    ? Math.floor((Date.now() - new Date(profile.publishedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  
  const baseViews = Math.floor(Math.random() * 50) + 10;
  const multiplier = Math.min(publishedDays + 1, 30);
  
  return {
    totalViews: baseViews * multiplier,
    uniqueVisitors: Math.floor((baseViews * multiplier) * 0.7),
    qrScans: Math.floor(Math.random() * 20) + 5,
    contactClicks: Math.floor(Math.random() * 15) + 3,
    viewsThisWeek: Array.from({ length: 7 }, () => Math.floor(Math.random() * 30) + 5),
    viewsThisMonth: baseViews * Math.min(multiplier, 30),
    topReferrers: [
      { source: 'Direct', visits: Math.floor(Math.random() * 40) + 20 },
      { source: 'Google', visits: Math.floor(Math.random() * 30) + 10 },
      { source: 'LinkedIn', visits: Math.floor(Math.random() * 20) + 5 },
      { source: 'QR Code', visits: Math.floor(Math.random() * 15) + 3 },
    ].sort((a, b) => b.visits - a.visits),
  };
};

export function useAnalytics(profile: LawyerProfile | null) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    if (profile && profile.isPublished) {
      // Simulate loading analytics
      const data = generateMockAnalytics(profile);
      setAnalytics(data);
    }
  }, [profile]);

  return { analytics };
}

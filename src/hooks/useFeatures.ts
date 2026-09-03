'use client';

import { useQuery } from '@tanstack/react-query';
import { getFeaturesOptions } from '@/generated/wokil-api/@tanstack/react-query.gen';

export type FeatureKey =
  | 'site_builder'
  | 'domain_purchase'
  | 'email_routing'
  | 'custom_dns'
  | 'business_cards'
  | 'legal_research'
  | 'court_calendar'
  | 'public_directory'
  | 'firm_roster';

export function useFeatures() {
  const { data, isLoading } = useQuery(getFeaturesOptions());
  return { features: data?.features as Record<string, boolean> | undefined, isLoading };
}

export function useFeatureEnabled(key: FeatureKey) {
  const { features, isLoading } = useFeatures();
  return { enabled: features?.[key] ?? true, isLoading };
}

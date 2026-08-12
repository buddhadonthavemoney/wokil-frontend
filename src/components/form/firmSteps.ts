import { FirmProfile } from '@/types/firm';
import { FirmDetailsStep } from '@/components/form/steps/FirmDetailsStep';
import { PracticeDetailsStep } from '@/components/form/steps/PracticeDetailsStep';
import { ContactInfoStep } from '@/components/form/steps/ContactInfoStep';
import { FirmAboutStep } from '@/components/form/steps/FirmAboutStep';
import { RosterStep } from '@/components/form/steps/RosterStep';
import { OnlinePresenceStep } from '@/components/form/steps/OnlinePresenceStep';
import { SubdomainSelectionStep } from '@/components/form/steps/SubdomainSelectionStep';
import { WizardStepDef, defineStep } from '@/components/form/WizardShell';

/** The groups of `FirmProfile` a wizard step can write to. */
export type FirmStepKey =
  | 'firmDetails'
  | 'practiceDetails'
  | 'contactInformation'
  | 'firmProfile'
  | 'roster'
  | 'onlinePresence'
  | 'subdomainSelection';

/**
 * The firm wizard, in order.
 *
 * Deliberately parallel to PROFILE_STEPS so the two flows read as one product:
 * same seven positions, same shell, with the roster taking the slot the lawyer
 * wizard gives to a career timeline.
 *
 * Four of the seven steps are the individual wizard's components used verbatim
 * — the shapes really are identical, so their prop types were narrowed to the
 * one group each reads rather than forking near-duplicate copies.
 */
export const FIRM_STEPS = [
  defineStep<FirmProfile, 'firmDetails'>({
    key: 'firmDetails',
    label: 'Firm',
    Component: FirmDetailsStep,
  }),
  defineStep<FirmProfile, 'practiceDetails'>({
    key: 'practiceDetails',
    label: 'Practice',
    Component: PracticeDetailsStep,
  }),
  defineStep<FirmProfile, 'contactInformation'>({
    key: 'contactInformation',
    label: 'Contact',
    Component: ContactInfoStep,
  }),
  defineStep<FirmProfile, 'firmProfile'>({
    key: 'firmProfile',
    label: 'Profile',
    Component: FirmAboutStep,
  }),
  defineStep<FirmProfile, 'roster'>({
    key: 'roster',
    label: 'Team',
    Component: RosterStep,
  }),
  defineStep<FirmProfile, 'onlinePresence'>({
    key: 'onlinePresence',
    label: 'Online',
    Component: OnlinePresenceStep,
  }),
  defineStep<FirmProfile, 'subdomainSelection'>({
    key: 'subdomainSelection',
    label: 'Subdomain',
    Component: SubdomainSelectionStep,
  }),
] satisfies WizardStepDef<FirmProfile, FirmStepKey>[];

import { LawyerProfile } from '@/types/lawyer';
import { BasicInfoStep } from '@/components/form/steps/BasicInfoStep';
import { PracticeDetailsStep } from '@/components/form/steps/PracticeDetailsStep';
import { ContactInfoStep } from '@/components/form/steps/ContactInfoStep';
import { ProfessionalProfileStep } from '@/components/form/steps/ProfessionalProfileStep';
import { TimelineStep } from '@/components/form/steps/TimelineStep';
import { OnlinePresenceStep } from '@/components/form/steps/OnlinePresenceStep';
import { SubdomainSelectionStep } from '@/components/form/steps/SubdomainSelectionStep';
import { WizardStepDef, defineStep } from '@/components/form/WizardShell';

/**
 * The groups of `LawyerProfile` a wizard step can write to — i.e. everything
 * except the server-derived fields, which no step owns.
 */
export type ProfileStepKey = keyof Omit<
  LawyerProfile,
  'id' | 'slug' | 'isPublished' | 'publishedAt' | 'siteUrl'
>;

/**
 * The individual-lawyer wizard, in order.
 *
 * This array is the *only* place the step list lives. It used to be spelled out
 * in five places — `STEP_NAMES`, the `switch (currentStep)`, and a `stepKeys`
 * array in each of `handleFillSample` and `resetCurrentStep`, plus a
 * `totalSteps = 7` that was linked to none of them — so adding or reordering a
 * step meant five edits and four chances to silently desync.
 *
 * `defineStep` pins each entry's `Component` to the payload type of its own
 * `key`, so pairing a step with the wrong updater is a compile error here.
 */
export const PROFILE_STEPS = [
  defineStep<LawyerProfile, 'basicInformation'>({
    key: 'basicInformation',
    label: 'Basic Info',
    Component: BasicInfoStep,
  }),
  defineStep<LawyerProfile, 'practiceDetails'>({
    key: 'practiceDetails',
    label: 'Practice',
    Component: PracticeDetailsStep,
  }),
  defineStep<LawyerProfile, 'contactInformation'>({
    key: 'contactInformation',
    label: 'Contact',
    Component: ContactInfoStep,
  }),
  defineStep<LawyerProfile, 'professionalProfile'>({
    key: 'professionalProfile',
    label: 'Profile',
    Component: ProfessionalProfileStep,
  }),
  defineStep<LawyerProfile, 'timeline'>({
    key: 'timeline',
    label: 'Timeline',
    Component: TimelineStep,
  }),
  defineStep<LawyerProfile, 'onlinePresence'>({
    key: 'onlinePresence',
    label: 'Online',
    Component: OnlinePresenceStep,
  }),
  defineStep<LawyerProfile, 'subdomainSelection'>({
    key: 'subdomainSelection',
    label: 'Subdomain',
    Component: SubdomainSelectionStep,
  }),
] satisfies WizardStepDef<LawyerProfile, ProfileStepKey>[];

export const PROFILE_TOTAL_STEPS = PROFILE_STEPS.length;

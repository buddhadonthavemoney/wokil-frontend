import { useState, useCallback, useEffect, useRef } from 'react';
import { FirmProfile, createBlankFirmProfile, toFirmProfile } from '@/types/firm';
import { getMyFirm, createFirm, updateFirm, deploySite } from '@/generated/wokil-api';
import { useToast } from '@/hooks/use-toast';
import { FIRM_STEPS, FIRM_TOTAL_STEPS, FirmStepKey } from '@/components/form/firmSteps';

const initialFirm = createBlankFirmProfile();

/**
 * The firm wizard's state.
 *
 * A sibling of useProfileForm rather than a genericisation of it: the two are
 * the same ~120 lines in shape but differ in what they load, what they save and
 * what "exists yet" means. One hook with three injected callbacks would be
 * harder to read than two that each say what they do.
 */
interface UseFirmFormOptions {
  /**
   * Step to open on, from the dashboard's "Edit roster" deep link.
   *
   * When set it also suppresses the resume-to-last-step below. Both run on
   * mount, but the resume waits on an async fetch and so always lands second —
   * without this it would silently drag the user off the step they asked for.
   */
  initialStep?: number;
}

export function useFirmForm({ initialStep }: UseFirmFormOptions = {}) {
  const totalSteps = FIRM_TOTAL_STEPS;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [firm, setFirm] = useState<FirmProfile>(() => ({ ...initialFirm }));
  const [currentStep, setCurrentStep] = useState(() =>
    initialStep && initialStep >= 1 ? Math.min(initialStep, FIRM_TOTAL_STEPS) : 1
  );

  // Whether the firm row exists yet decides create-vs-update on save. The
  // wizard is entered before any firm exists, so the first save must POST.
  const [firmExists, setFirmExists] = useState(false);
  const lastSavedFirm = useRef(JSON.stringify(initialFirm));

  useEffect(() => {
    const fetchFirm = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        setLoading(true);
        const data = (await getMyFirm({ throwOnError: true })).data as Partial<FirmProfile>;
        // The endpoint answers {} when the caller has no firm yet, which is not
        // an error — it is the ordinary first-visit state.
        if (data && data.id) {
          setFirm((prev) => toFirmProfile(data, prev));
          setFirmExists(true);
          // Resume where they left off — unless a step was explicitly asked for.
          if (data.slug && !initialStep) setCurrentStep(totalSteps);
        }
      } catch (error) {
        console.error('Failed to fetch firm', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFirm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading === false) {
      lastSavedFirm.current = JSON.stringify(firm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const saveFirmData = useCallback(async () => {
    const currentJson = JSON.stringify(firm);
    if (currentJson === lastSavedFirm.current) return;

    // A firm needs a name before it can be created — the backend rejects it
    // otherwise, and the wizard would keep retrying on every step.
    if (!firmExists && !firm.firmDetails.name.trim()) return;

    try {
      const payload = { ...firm };
      // Once deployed the subdomain is locked server-side; re-sending it turns
      // an ordinary save into a 400.
      if (firm.firmProfile?.deploymentURL) {
        delete (payload as Partial<FirmProfile>).subdomainSelection;
      }

      if (firmExists) {
        await updateFirm({ body: payload as FirmProfile, throwOnError: true });
      } else {
        await createFirm({ body: payload as FirmProfile, throwOnError: true });
        setFirmExists(true);
      }
      lastSavedFirm.current = currentJson;
    } catch (error) {
      console.error('Failed to auto-save firm:', error);
    }
  }, [firm, firmExists]);

  const updateNestedFirm = useCallback(
    <K extends FirmStepKey>(category: K, fields: Partial<FirmProfile[K]>) => {
      setFirm((prev) => {
        const current = prev[category];
        // The roster is a list, and removing a member has to shorten it —
        // merging index-by-index would leave stale trailing entries behind.
        const next =
          Array.isArray(current) || Array.isArray(fields)
            ? fields
            : { ...(current as object), ...(fields as object) };
        return { ...prev, [category]: next };
      });
    },
    []
  );

  const nextStep = useCallback(async () => {
    await saveFirmData();
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  }, [totalSteps, saveFirmData]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      setCurrentStep(Math.min(Math.max(step, 1), totalSteps));
    },
    [totalSteps]
  );

  const resetCurrentStep = useCallback(() => {
    const key = FIRM_STEPS[currentStep - 1]?.key;
    if (!key) return;

    setFirm((prev) => ({ ...prev, [key]: initialFirm[key] }));
    toast({
      title: 'Step Cleared',
      description: `Reset ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} to initial state.`,
    });
  }, [currentStep, toast]);

  /**
   * Saves, then queues the deploy.
   *
   * Deliberately does not set isPublished/siteUrl: both are derived server-side
   * from the sites table, and deploySite only *queues* the work — the DNS record
   * lands several steps later. The deploy stream's terminal event refetches for
   * the truth. (Same reasoning as publishProfile; see useProfileForm.)
   */
  const publishFirm = useCallback(async () => {
    try {
      await saveFirmData();
      await deploySite({ throwOnError: true });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to publish firm site.',
        variant: 'destructive',
      });
    }
  }, [saveFirmData, toast]);

  return {
    firm,
    currentStep,
    totalSteps,
    loading,
    firmExists,
    updateNestedFirm,
    nextStep,
    prevStep,
    goToStep,
    saveFirmData,
    publishFirm,
    setFirm,
    resetCurrentStep,
  };
}

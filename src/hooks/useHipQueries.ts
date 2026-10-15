import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchHipPatients,
  linkCareContextBatch,
  linkSelectedCareContext,
  type CareContextVisitItem,
} from "@/services/hipService";
import { queryKeys } from "@/api/queryKeys";
import type { HipPatient } from "@/types/hip";
import { notify } from "@/lib/notify";
import { toast } from "@/components/ui/toast";

/**
 * Query hook to fetch HIP patients with unique IDs and normalized fields.
 */
export function useHipPatients(options?: { refetchInterval?: number | false }) {
  return useQuery<HipPatient[], Error>({
    queryKey: queryKeys.patients.hipList(),
    queryFn: async () => {
      const patients = await fetchHipPatients();
      return patients.map((patient, index) => ({
        ...patient,
        id:
          patient.id ||
          (patient.carecontextid
            ? `hip_${patient.carecontextid}_${index}`
            : `hip_row_${patient.uhid ?? "pt"}_${index + 1}`),
      }));
    },
    staleTime: 1000 * 60, // 1 minute fresh
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Mutation hook for Care Context linking (POST /api/care-context/link-selected).
 * Supports visits array and dry_run option.
 * Automatically invalidates the patients cache to reflect new linking statuses.
 */
export function useLinkCareContextBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      args:
        | { visits: CareContextVisitItem[]; dryRun?: boolean }
        | CareContextVisitItem[]
        | string[]
    ) => {
      if (args && typeof args === "object" && !Array.isArray(args) && "visits" in args) {
        return await linkSelectedCareContext(args.visits, args.dryRun ?? false);
      }
      return await linkCareContextBatch(args as any);
    },
    onSuccess: (_, variables) => {
      // Invalidate patient list so UI updates without manual browser refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
      const isDryRun =
        variables &&
        typeof variables === "object" &&
        !Array.isArray(variables) &&
        "dryRun" in variables
          ? Boolean(variables.dryRun)
          : false;

      if (isDryRun) {
        toast.success("Dry run preview completed successfully (validated without sending to Eka).");
      } else {
        toast.success(
          "Care Context linking request accepted and submitted successfully (202)."
        );
      }
    },
    onError: (err: any) => {
      console.error("Care Context linking batch error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to submit Care Context linking request.";
      notify.serverError(msg);
    },
  });
}


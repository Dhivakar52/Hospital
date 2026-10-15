import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchHipPatients, linkCareContextBatch } from "@/services/hipService";
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
 * Mutation hook for batch Care Context linking (POST /api/care-context/link-multiple).
 * Automatically invalidates the patients cache to reflect new linking statuses.
 */
export function useLinkCareContextBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (uhids: string[]) => {
      return await linkCareContextBatch(uhids);
    },
    onSuccess: () => {
      // Invalidate patient list so UI updates without manual browser refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
      toast.success(
        "Care Context linking request accepted and submitted successfully (202)."
      );
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

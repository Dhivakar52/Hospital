import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/api/queryKeys";
import { mockPatients } from "@/data/mockPatients";
import type { Patient } from "@/types/op_register";

import { resolvePatientDetails } from "@/types/op_register";

/**
 * Hook to retrieve registered OP patients.
 * Managed via TanStack Query for cache consistency and background refetching.
 */
export function useRegisteredPatients() {
  return useQuery<Patient[], Error>({
    queryKey: queryKeys.patients.registeredList(),
    queryFn: async () => {
      return mockPatients;
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to retrieve single OP patient details by ID or UHID.
 */
export function usePatientDetail(
  id: string | undefined,
  routerStatePatient?: Patient | null
) {
  return useQuery<ReturnType<typeof resolvePatientDetails>, Error>({
    queryKey: queryKeys.patients.byUhid(id || ""),
    queryFn: async () => {
      if (
        routerStatePatient &&
        (routerStatePatient.id === id || routerStatePatient.opNo === id)
      ) {
        return resolvePatientDetails(routerStatePatient);
      }
      const found = mockPatients.find(
        (p) => p.id === id || p.opNo === id
      );
      if (found) {
        return resolvePatientDetails(found);
      }
      throw new Error(`No patient record found for UHID: "${id}".`);
    },
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Mutation hook for deleting an OP registered patient.
 * Directly updates TanStack Query cache without requiring page refresh.
 */
export function useDeleteRegisteredPatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (idOrUhid: string) => {
      return idOrUhid;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<Patient[]>(
        queryKeys.patients.registeredList(),
        (old) =>
          old
            ? old.filter((p) => p.id !== deletedId && p.opNo !== deletedId)
            : []
      );
    },
  });
}

import type { CareContextResponse } from "@/types/op_register";

export const SAMPLE_CARE_CONTEXT_RESPONSE: CareContextResponse = {
  service: "abdm",
  event: "abha.link_care_context",
  event_time: 1790427371,
  transaction_id: "a573aa96-72f0-4062-bbcd-479323981307",
  timestamp: 1790427376,
  business_id: "7178592304341534",
  client_id: "EC_178592308444711",
  data: {
    abha_address: "testingmani@sbx",
    care_context_id: "a75cd486-cdg7-4e1f-9a0b-0597e1f28452",
    hip_id: "SRM_CHENNAI",
    oid: "178926556783523",
    partner_patient_id: "178926556783523",
    status: "LINKED",
  },
};

/**
 * Known Care Context data map for demonstration registration patients.
 * Patients present in this map will show the Care Context action.
 */
export const KNOWN_CARE_CONTEXTS: Record<string, CareContextResponse> = {
  "26588922": {
    service: "abdm",
    event: "abha.link_care_context",
    event_time: 1790427371,
    transaction_id: "a573aa96-72f0-4062-bbcd-479323981307",
    timestamp: 1790427376,
    business_id: "7178592304341534",
    client_id: "EC_178592308444711",
    data: {
      abha_address: "testingmani@sbx",
      care_context_id: "a75cd486-cdg7-4e1f-9a0b-0597e1f28452",
      hip_id: "SRM_CHENNAI",
      oid: "178926556783523",
      partner_patient_id: "178926556783523",
      status: "LINKED",
    },
  },
  "26588924": {
    service: "abdm",
    event: "abha.link_care_context",
    event_time: 1790428100,
    transaction_id: "b684bb07-83f1-4173-ccde-580434092418",
    timestamp: 1790428105,
    business_id: "7178592304341535",
    client_id: "EC_178592308444711",
    data: {
      abha_address: "priyakumar@sbx",
      care_context_id: "b86de597-deh8-5f2a-0b1c-1608f2a39563",
      hip_id: "SRM_CHENNAI",
      oid: "178926556783524",
      partner_patient_id: "178926556783524",
      status: "LINKED",
    },
  },
  "26588927": {
    service: "abdm",
    event: "abha.link_care_context",
    event_time: 1790429520,
    transaction_id: "c795cc18-94a2-5284-ddfe-691545103529",
    timestamp: 1790429525,
    business_id: "7178592304341536",
    client_id: "EC_178592308444711",
    data: {
      abha_address: "anithag@sbx",
      care_context_id: "c97ef608-efi9-6g3b-1c2d-2719a3b40674",
      hip_id: "SRM_CHENNAI",
      oid: "178926556783525",
      partner_patient_id: "178926556783525",
      status: "LINKED",
    },
  },
  "26588929": {
    service: "abdm",
    event: "abha.link_care_context",
    event_time: 1790430200,
    transaction_id: "d806dd29-05b3-6395-eef0-702656214630",
    timestamp: 1790430205,
    business_id: "7178592304341537",
    client_id: "EC_178592308444711",
    data: {
      abha_address: "lakshmipriya@sbx",
      care_context_id: "da8fa719-fg0a-7h4c-2d3e-3820b4c51785",
      hip_id: "SRM_CHENNAI",
      oid: "178926556783526",
      partner_patient_id: "178926556783526",
      status: "LINKED",
    },
  },
};

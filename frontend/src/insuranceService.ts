// Copyright (c) 2024 Digital Asset (Canton) Core Team. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { DamlContract, CreateCommand, ExerciseCommand, Query } from './types';

// --- Configuration ---
// The base URL for the Canton JSON API. Assumes the API is running on port 7575.
// This can be configured via a .env file in the frontend root (REACT_APP_LEDGER_URL).
const LEDGER_URL = process.env.REACT_APP_LEDGER_URL || 'http://localhost:7575/v1';

// --- Type Definitions for Daml Templates ---
// These interfaces should match the structure of your Daml templates.
// Note: 'Decimal' in Daml is represented as a 'string' in the JSON API.

export interface Policy {
  insurer: string;
  insured: string;
  policyId: string;
  premium: string;
  coverageAmount: string;
  triggerEventDescription: string;
  triggerThreshold: string;
  assetIdentifier: string;
  isActive: boolean;
  claimProcessor: string;
}

export interface OracleEventData {
  oracle: string;
  subscribers: string[];
  eventId: string;
  eventType: string;
  eventValue: string;
  eventTime: string;
  assetIdentifier: string;
}

export interface ProcessedClaim {
  claimId: string;
  policyCid: string; // This is a ContractId, represented as a string
  insurer: string;
  insured: string;
  eventData: OracleEventData;
  payoutAmount: string;
  processingTime: string;
}

export interface PayoutInstruction {
  payer: string;
  receiver: string;
  amount: string;
  reference: string;
  settled: boolean;
}

// --- Generic API Helper ---

/**
 * A generic fetch wrapper for the Canton JSON API to reduce boilerplate.
 * @param endpoint The API endpoint (e.g., 'create', 'exercise', 'query').
 * @param token The JWT token for authentication.
 * @param body The request body for the POST request.
 * @returns The 'result' field from the JSON API response.
 * @throws An error if the network request or the API call fails.
 */
async function apiFetch(endpoint: 'create' | 'exercise' | 'query', token: string, body: object): Promise<any> {
  try {
    const response = await fetch(`${LEDGER_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
    }

    const jsonResponse = await response.json();
    if (jsonResponse.status !== 200) {
      throw new Error(`JSON API returned non-200 status: ${JSON.stringify(jsonResponse.errors)}`);
    }

    return jsonResponse.result;
  } catch (error) {
    console.error(`Error during API call to '${endpoint}':`, error);
    throw error;
  }
}

// --- Ledger Service Functions ---

/**
 * Creates a new parametric insurance policy on the ledger.
 * @param token The authentication token for the insurer.
 * @param policy The policy data to be stored on the contract.
 * @returns The created policy contract.
 */
export const createPolicy = async (token: string, policy: Policy): Promise<DamlContract<Policy>> => {
  const command: CreateCommand<Policy> = {
    templateId: 'InsurancePolicy:Policy', // Assuming main module is InsurancePolicy
    payload: policy,
  };
  return apiFetch('create', token, command);
};

/**
 * Fetches all active insurance policies visible to the party associated with the token.
 * @param token The party's authentication token.
 * @returns A list of active policy contracts.
 */
export const getActivePolicies = async (token: string): Promise<DamlContract<Policy>[]> => {
  const query: Query = {
    templateIds: ['InsurancePolicy:Policy'],
    query: { isActive: true },
  };
  return apiFetch('query', token, query);
};

/**
 * Fetches OracleEventData contracts for a specific asset, visible to the token's party.
 * @param token The authentication token.
 * @param assetIdentifier The unique identifier of the insured asset.
 * @returns A list of relevant oracle event contracts.
 */
export const getOracleDataForAsset = async (token: string, assetIdentifier: string): Promise<DamlContract<OracleEventData>[]> => {
    const query: Query = {
        templateIds: ['OracleEvent:OracleEventData'],
        query: { assetIdentifier },
    };
    return apiFetch('query', token, query);
}

/**
 * Exercises the choice to process a claim on a policy using specific oracle data.
 * @param token The authentication token of the claim processor party.
 * @param policyCid The ContractId of the InsurancePolicy:Policy contract.
 * @param eventDataCid The ContractId of the OracleEvent:OracleEventData contract to use for processing.
 * @returns The result of the choice exercise, typically the created ProcessedClaim contract.
 */
export const processClaim = async (token: string, policyCid: string, eventDataCid: string): Promise<any> => {
  const command: ExerciseCommand = {
    templateId: 'InsurancePolicy:Policy',
    contractId: policyCid,
    choice: 'ProcessClaimWithOracleData', // Assumed choice name in the Policy template
    argument: {
      eventDataCid,
    },
  };
  return apiFetch('exercise', token, command);
};

/**
 * Fetches all processed claims visible to the party associated with the token.
 * @param token The party's authentication token.
 * @returns A list of processed claim contracts.
 */
export const getProcessedClaims = async (token: string): Promise<DamlContract<ProcessedClaim>[]> => {
  const query: Query = {
    templateIds: ['ClaimProcessor:ProcessedClaim'],
  };
  return apiFetch('query', token, query);
};

/**
 * Fetches all payout instructions visible to the party associated with the token.
 * @param token The party's authentication token.
 * @returns A list of payout instruction contracts.
 */
export const getPayouts = async (token: string): Promise<DamlContract<PayoutInstruction>[]> => {
  const query: Query = {
    templateIds: ['Payout:PayoutInstruction'],
    query: { settled: false }, // Typically, we only care about unsettled payouts
  };
  return apiFetch('query', token, query);
};

/**
 * Exercises the choice to mark a payout as settled.
 * @param token The authentication token of the payer (insurer).
 * @param payoutCid The ContractId of the Payout:PayoutInstruction contract.
 * @returns The result of the choice exercise.
 */
export const settlePayout = async (token: string, payoutCid: string): Promise<any> => {
    const command: ExerciseCommand = {
      templateId: 'Payout:PayoutInstruction',
      contractId: payoutCid,
      choice: 'MarkAsSettled',
      argument: {},
    };
    return apiFetch('exercise', token, command);
  };
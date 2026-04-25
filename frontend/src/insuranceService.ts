import { ContractId } from "@c7/ledger";

// In a real application, these values would come from a configuration file or environment variables.
const LEDGER_URL = process.env.REACT_APP_LEDGER_URL || 'http://localhost:7575';

// The package ID is a hash of the compiled Daml code. It can be found in the .daml/dist directory
// or by using `dpm damlc inspect-dar --json .daml/dist/your-project-version.dar`.
// It's recommended to set this via an environment variable during the build process.
const PACKAGE_ID = process.env.REACT_APP_PACKAGE_ID || 'canton-insurance-claims-0.1.0';

/**
 * A generic helper function to make authenticated POST requests to the JSON API.
 * @param endpoint The API endpoint to hit (e.g., '/v1/create').
 * @param token The JWT for authentication.
 * @param body The JSON body of the request.
 * @returns The JSON response from the ledger.
 */
const apiFetch = async (endpoint: string, token: string, body: object) => {
  const response = await fetch(`${LEDGER_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API call to ${endpoint} failed with status ${response.status}:`, errorText);
    throw new Error(`API call failed: ${errorText}`);
  }
  return response.json();
};

// --- Type Definitions ---
// These types should correspond to the Daml templates in your model.
// Using a code generator like `dpm codegen-js` is the recommended way to create these in a real project.

export interface PolicyParameters {
  description: string;
  triggerType: "Rainfall" | "FlightDelay";
  triggerThreshold: string; // Daml Decimal
  payout: string; // Daml Decimal
}

export interface PolicyProposal {
  insurer: string; // Daml Party
  insured: string; // Daml Party
  operator: string; // Daml Party
  premium: string; // Daml Decimal
  currency: string;
  parameters: PolicyParameters;
}

export interface Policy extends PolicyProposal {
  // The active Policy has the same data as the proposal in this model
}

export interface Claim {
  insurer: string;
  insured: string;
  operator: string;
  payout: string;
  currency: string;
  reason: string;
  policyCid: ContractId<Policy>;
}

export interface OracleData {
  operator: string;
  dataType: string;
  value: string; // Daml Decimal (e.g., rainfall in mm or delay in minutes)
  observationTime: string; // Daml Time
}

/**
 * Represents an active contract on the ledger, as returned by the JSON API.
 */
export interface ActiveContract<T> {
  contractId: ContractId<T>;
  templateId: string;
  payload: T;
}

// --- Service Functions ---

/**
 * Queries the ledger for active contracts of a given template visible to the party.
 * @param token The JWT of the party performing the query.
 * @param templateName The template name, e.g., 'Insurance.Policy:Policy'.
 * @returns A promise that resolves to an array of active contracts.
 */
export const queryContracts = async <T>(token: string, templateName: string): Promise<ActiveContract<T>[]> => {
  const templateId = `${PACKAGE_ID}:${templateName}`;
  const response = await apiFetch('/v1/query', token, { templateIds: [templateId] });
  return response.result || [];
};

/**
 * Creates a new insurance policy proposal.
 * @param token The JWT of the insurer.
 * @param proposal The data for the policy proposal.
 * @returns The result of the create command from the ledger.
 */
export const createPolicyProposal = async (token: string, proposal: PolicyProposal): Promise<any> => {
  return apiFetch('/v1/create', token, {
    templateId: `${PACKAGE_ID}:Insurance.Policy:PolicyProposal`,
    payload: proposal,
  });
};

/**
 * Accepts a policy proposal, turning it into an active policy.
 * @param token The JWT of the insured.
 * @param proposalCid The contract ID of the `PolicyProposal` to accept.
 * @returns The result of the exercise command.
 */
export const acceptPolicyProposal = async (token: string, proposalCid: ContractId<PolicyProposal>): Promise<any> => {
  return apiFetch('/v1/exercise', token, {
    templateId: `${PACKAGE_ID}:Insurance.Policy:PolicyProposal`,
    contractId: proposalCid,
    choice: 'Accept',
    argument: {},
  });
};

/**
 * Creates an oracle data contract representing an external event.
 * @param token The JWT of the oracle operator.
 * @param data The oracle data to be recorded.
 * @returns The result of the create command.
 */
export const createOracleData = async (token: string, data: OracleData): Promise<any> => {
  return apiFetch('/v1/create', token, {
    templateId: `${PACKAGE_ID}:Insurance.Oracle:OracleData`,
    payload: data,
  });
};

/**
 * Processes an oracle event against an active policy. This may trigger a claim if conditions are met.
 * @param token The JWT of the operator.
 * @param policyCid The contract ID of the `Policy`.
 * @param oracleDataCid The contract ID of the `OracleData` contract for the event.
 * @returns The result of the exercise command.
 */
export const processEvent = async (token: string, policyCid: ContractId<Policy>, oracleDataCid: ContractId<OracleData>): Promise<any> => {
  return apiFetch('/v1/exercise', token, {
    templateId: `${PACKAGE_ID}:Insurance.Policy:Policy`,
    contractId: policyCid,
    choice: 'ProcessEvent',
    argument: { oracleDataCid },
  });
};

/**
 * Settles a claim, which would typically involve an off-ledger payment and then archiving the claim contract.
 * @param token The JWT of the insurer.
 * @param claimCid The contract ID of the `Claim` to settle.
 * @returns The result of the exercise command.
 */
export const settleClaim = async (token: string, claimCid: ContractId<Claim>): Promise<any> => {
  return apiFetch('/v1/exercise', token, {
    templateId: `${PACKAGE_ID}:Insurance.Claim:Claim`,
    contractId: claimCid,
    choice: 'Settle',
    argument: {},
  });
};
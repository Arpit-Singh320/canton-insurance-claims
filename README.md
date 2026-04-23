# Canton Parametric Insurance Claims

[![CI](https://github.com/digital-asset/canton-insurance-claims/actions/workflows/ci.yml/badge.svg)](https://github.com/digital-asset/canton-insurance-claims/actions/workflows/ci.yml)

This project demonstrates a parametric insurance application built on the [Canton Network](https://www.canton.network/) using the [Daml](https://www.daml.com/) smart contract language. It automates the insurance claim process by triggering payouts based on objective, verifiable data from an external oracle, eliminating the need for manual claims assessment.

## What is Parametric Insurance?

Parametric (or index-based) insurance is a type of insurance that pays out a pre-agreed amount when a specific, measurable event occurs. Unlike traditional insurance, which compensates for the actual loss incurred, parametric insurance pays out based on a trigger event meeting a certain threshold.

**Examples:**
*   **Flight Insurance:** Pays out if a flight is delayed by more than 2 hours.
*   **Crop Insurance:** Pays out if rainfall in a region falls below a certain level during the growing season.
*   **Hurricane Insurance:** Pays out if a hurricane of a specific category makes landfall at a given location.

The key benefit is the speed and transparency of the payout process. Since the trigger is based on objective data from a trusted source (an oracle), claims can be settled automatically and almost instantly, reducing administrative overhead and uncertainty for the policyholder.

## Why Canton and Daml?

Canton and Daml provide an ideal platform for this use case:
*   **Privacy:** Canton's privacy model ensures that policy details are only visible to the insurer, the policyholder, and any other designated stakeholders (like the oracle), not the entire network.
*   **Atomicity:** The entire claim settlement process—from the oracle's trigger to the creation of the payout obligation—can be executed as a single, atomic transaction. This guarantees that the payout occurs if and only if the trigger condition is met.
*   **Data Integrity:** Daml's strong typing and formal guarantees ensure that the contract logic is executed exactly as written, preventing disputes and errors.
*   **Interoperability:** Canton is designed for interoperability, allowing for seamless integration with external data sources (oracles) and payment systems (e.g., stablecoins).

## Project Architecture

This project is composed of two main parts:

1.  **Daml Model (`/daml`)**: Contains the core smart contract logic defining the insurance workflow.
    *   `Insurance.Policy`: The central template representing an active insurance policy. It defines the policyholder, insurer, premium, payout amount, and the trigger condition.
    *   `Insurance.Oracle`: Defines the role of the oracle and provides the mechanism for them to submit trigger data to the ledger.
    *   `Insurance.Claim`: A contract created automatically when a policy's trigger condition is met, representing the insurer's obligation to pay the policyholder.

2.  **React Frontend (`/frontend`)**: A web-based user interface for interacting with the smart contracts.
    *   Built with TypeScript, React, and Vite.
    *   Uses the `@c7/react` and `@c7/ledger` libraries to communicate with the Canton ledger's JSON API.
    *   Provides views for the Insurer, Policyholder, and Oracle to manage policies and trigger events.

## Prerequisites

*   **DPM (Daml Package Manager)**: [Installation Guide](https://docs.daml.com/dpm/getting-started/install-dpm.html) (v3.4.0 or later)
*   **Node.js**: v18 or later
*   **npm**: v9 or later

## Getting Started

Follow these steps to run the application locally.

**1. Clone the Repository**

```bash
git clone https://github.com/digital-asset/canton-insurance-claims.git
cd canton-insurance-claims
```

**2. Build the Daml Model**

Compile the Daml smart contracts into a DAR (Daml Archive) file.

```bash
dpm build
```
This will create a file at `.daml/dist/canton-insurance-claims-0.1.0.dar`.

**3. Start the Local Canton Ledger**

Run a local Canton sandbox instance. This also starts the JSON API on port `7575`.

```bash
dpm sandbox
```
Keep this process running in a separate terminal window.

**4. Install Frontend Dependencies**

```bash
cd frontend
npm install
```

**5. Run the Frontend Application**

```bash
npm start
```
This will launch the React application, which you can access at `http://localhost:5173`.

## Core Workflow

The application demonstrates the end-to-end lifecycle of a parametric insurance policy.

1.  **Party Login**: The UI simulates a login screen where you can choose to act as the `Insurer`, `Policyholder`, or `Oracle` party.
2.  **Policy Creation**: The `Insurer` creates a new policy proposal, specifying the `Policyholder`, premium, potential payout, and a trigger condition (e.g., "Wind Speed > 150 km/h").
3.  **Policy Acceptance**: The `Policyholder` sees the proposal in their dashboard and can choose to accept it. Upon acceptance, the premium is considered paid, and an active `Insurance.Policy` contract is created on the ledger.
4.  **Oracle Event Trigger**: The `Oracle` party observes a real-world event. They use their dashboard to find the relevant policy and submit the observed data (e.g., "Wind Speed: 165 km/h").
5.  **Automated Claim Settlement**: The `Policy` contract receives the data from the `Oracle`. It automatically checks if the trigger condition is met.
    *   If `165 > 150`, the condition is met.
    *   The `Policy` contract is atomically archived, and a new `Insurance.Claim` contract is created.
6.  **Payout**: The `Policyholder` now holds an `Insurance.Claim` contract, which is a firm, undeniable obligation from the `Insurer` to pay the settlement amount. The UI shows this claim as ready for payout.

## Running Tests

The project includes Daml Script tests to verify the contract logic without needing a UI. To run them:

```bash
dpm test
```
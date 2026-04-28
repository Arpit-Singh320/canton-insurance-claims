# Canton Parametric Insurance Claims

This project demonstrates a parametric insurance application built on the Canton network using Daml smart contracts. It showcases how to automate insurance claim processing and settlement based on verifiable, real-world data from oracles.

The application allows an insurer to issue policies that pay out automatically when a specific, measurable event occurs, such as a flight delay or an adverse weather event. This removes the need for a manual claims process, reducing administrative overhead and leading to faster payouts for the insured.

## Core Concepts

### What is Parametric Insurance?

Unlike traditional insurance, which pays out based on the magnitude of an assessed loss, parametric insurance pays out a pre-agreed amount when a specific, measurable event (a "parameter") occurs and is verified by a trusted data source (an "oracle").

- **Example 1: Flight Delay Insurance.** A policy pays out $200 if a specific flight is delayed by more than 2 hours. The oracle is the airline's official flight status data feed.
- **Example 2: Crop Insurance.** A policy pays out $10,000 if rainfall in a specific region is less than 50mm during the growing season. The oracle is a national weather service.

### Why Canton and Daml?

Canton and Daml provide an ideal platform for implementing parametric insurance for several key reasons:

*   **Automation & Efficiency:** Daml smart contracts encode the policy logic directly. When oracle data meets the policy's trigger condition, the claim and payout logic are executed automatically and instantly.
*   **Privacy by Design:** Canton's privacy model ensures that policy details are strictly confidential. A policy contract is only visible to the insurer and the insured, not to the entire network or competing insurers.
*   **Atomic Settlement:** The entire workflow—from data submission by the oracle, to claim creation, to payout initiation—can be executed as a single, atomic transaction. This eliminates settlement risk and ensures that payouts occur if and only if the conditions are met.
*   **Verifiability and Auditability:** All triggering events and contract state changes are immutably recorded on the ledger, creating a transparent and tamper-proof audit trail for regulators and all parties involved.

## Daml Model Overview

The core logic is captured in a few key Daml templates:

*   **`Insurance.Policy.Policy`**: Represents the insurance agreement between the `insurer` and the `insured`. It specifies the premium, payout amount, and the trigger condition (e.g., `flightDelayed = True`). It is signed by both parties.
*   **`Insurance.Oracle.OracleRequest`**: A contract created by the `insurer` to request data for a specific policy from a trusted `oracle`.
*   **`Insurance.Policy.TriggeredPolicy`**: When an `oracle` provides data that meets the policy's condition, the `Policy` is consumed and evolves into a `TriggeredPolicy`, which represents an undeniable obligation for the insurer to pay.
*   **`Insurance.Claims.Claim`**: The final contract in the workflow, representing the settled claim.

## Project Structure

```
.
├── .github/workflows/ci.yml # GitHub Actions CI configuration
├── daml/                      # Daml smart contracts
│   ├── daml.yaml              # Daml package configuration
│   └── Insurance/             # Main application module
│       ├── Claims.daml
│       ├── Oracle.daml
│       └── Policy.daml
│       └── Setup.daml         # Daml Script for test setup
├── frontend/                  # React TypeScript frontend
│   ├── public/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── PolicyView.tsx
│   │   └── insuranceService.ts
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
└── README.md
```

## Getting Started

Follow these steps to build and run the application locally.

### Prerequisites

*   [DPM (Canton SDK) v3.4.0 or later](https://www.digitalasset.com/developers)
*   [Node.js](https://nodejs.org/) v18 or later

### 1. Clone the Repository

```bash
git clone https://github.com/digital-asset/canton-insurance-claims.git
cd canton-insurance-claims
```

### 2. Start the Canton Ledger

Open a new terminal window and start the local Canton sandbox environment. This also starts the JSON API on port 7575.

```bash
dpm sandbox
```

### 3. Build and Deploy the Daml Contracts

In a separate terminal, build the Daml code into a DAR (Daml Archive).

```bash
dpm build
```

This command compiles your Daml code and creates a `.dar` file in the `.daml/dist/` directory.

### 4. Run the Setup Script

To populate the ledger with an Insurer, an Oracle, and a Customer party, along with some sample policies, run the provided Daml Script.

```bash
dpm damlc script \
  --dar .daml/dist/canton-insurance-claims-0.1.0.dar \
  --script-name Insurance.Setup:setup \
  --ledger-host localhost \
  --ledger-port 6866
```

### 5. Install Frontend Dependencies and Run

Finally, navigate to the `frontend` directory, install dependencies, and start the React application.

```bash
cd frontend
npm install
npm start
```

The application will now be running at `http://localhost:3000`. You can log in using the parties created by the setup script (e.g., `Insurer`, `Alice`, `Oracle`) to interact with the application from different perspectives.

## Technology Stack

*   **Ledger:** [Canton](https://www.canton.io/)
*   **Smart Contracts:** [Daml](https://www.daml.com/)
*   **Frontend:** [TypeScript](https://www.typescriptlang.org/), [React](https://reactjs.org/), [@c7/react](https://docs.daml.com/canton-ui/react-introduction.html)
*   **Build/Tooling:** [DPM (Digital Asset Package Manager)](https://www.digitalasset.com/developers)

## License

This project is licensed under the [Apache License 2.0](LICENSE).
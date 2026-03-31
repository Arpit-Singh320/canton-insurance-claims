# Canton Parametric Insurance Claims Project

This project demonstrates a parametric insurance system built on the Canton network using Daml smart contracts.  Parametric insurance provides payouts based on pre-defined parameters (e.g., weather conditions, flight delays, crop yields) rather than assessed loss.  This allows for automated claim settlement and reduces the need for manual claims processing.

## Overview

The core idea is to create insurance policies that automatically trigger payouts when certain conditions are met, as determined by external oracle data. This is achieved through Daml smart contracts that define policy terms, receive data from oracles, and execute payouts atomically when thresholds are breached.

## Key Components

*   **Policy Contract:** Defines the terms of the insurance policy, including the triggering event, threshold, and payout amount.
*   **Oracle Role Contract:** Establishes a trusted relationship with an oracle that provides data feeds.
*   **Oracle Data Feed Contract:**  Represents a specific data point provided by the oracle (e.g., daily rainfall).
*   **Payout Logic:** Automatically calculates and executes payouts when the oracle data meets the policy's defined threshold.
*   **Claim Settlement:** Automated and immediate upon threshold breach.

## Daml Contracts

The `daml` directory contains the Daml smart contracts that define the insurance logic. Key contracts include:

*   `Policy.daml`: Defines the `Policy` template and related choices.
*   `Oracle.daml`: Defines the `OracleRole` and `OracleDataFeed` templates.
*   `Claims.daml`: Contains claim settlement logic and related contracts.

## Usage

1.  **Define Policies:** Insurers create policies specifying the trigger event, threshold, and payout amount.
2.  **Oracle Integration:** Trusted oracles provide data feeds to the Canton network.
3.  **Automated Payouts:** When the oracle data meets the policy's threshold, the contract automatically triggers a payout to the insured party.

## Development

### Prerequisites

*   Daml SDK (version 3.1.0 or later)
*   Canton Network setup

### Building the Project

```bash
daml build
```

### Testing the Project

```bash
daml test
```

### Running the Project

To run the project against a Canton network, you'll need to configure the Canton participants and upload the DAR file. Example configurations and deployment scripts will be added.

## Contributing

Contributions are welcome! Please submit pull requests with clear descriptions of the changes.

## License

[Choose a license, e.g., Apache 2.0]
import React from 'react';
import { useDamlLedger, useStreamQueries } from '@c7/react';
import { Contract } from '@c7/ledger';
import {
  Policy,
  Claim,
  Payout
} from '@daml.js/canton-insurance-claims-0.1.0/lib/Insurance/Policy';

const cardStyle: React.CSSProperties = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #dee2e6',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 0',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  fontFamily: 'Arial, sans-serif',
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #e9ecef',
  paddingBottom: '12px',
  marginBottom: '16px',
};

const policyIdStyle: React.CSSProperties = {
  fontSize: '1.2em',
  fontWeight: 'bold',
  color: '#343a40',
};

const statusBadgeBase: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: '16px',
  color: 'white',
  fontWeight: 'bold',
  fontSize: '0.9em',
  textTransform: 'uppercase',
};

const statusColors = {
  Active: '#28a745',
  Triggered: '#ffc107',
  Paid: '#007bff',
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '12px 24px',
};

const detailItemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

const detailLabelStyle: React.CSSProperties = {
  color: '#6c757d',
  fontSize: '0.9em',
  marginBottom: '4px',
};

const detailValueStyle: React.CSSProperties = {
  color: '#212529',
  fontSize: '1em',
};

type PolicyStatus = 'Active' | 'Triggered' | 'Paid';

interface StatusBadgeProps {
  status: PolicyStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyle = {
    ...statusBadgeBase,
    backgroundColor: statusColors[status],
  };
  return <span style={statusStyle}>{status}</span>;
};

interface PolicyCardProps {
  policy: Contract<Policy>;
  status: PolicyStatus;
}

const PolicyCard: React.FC<PolicyCardProps> = ({ policy, status }) => {
  const {
    policyId,
    insurer,
    assetId,
    coverageAmount,
    premium,
    parametricData
  } = policy.payload;

  return (
    <div style={cardStyle}>
      <div style={cardHeaderStyle}>
        <span style={policyIdStyle}>Policy #{policyId}</span>
        <StatusBadge status={status} />
      </div>
      <div style={gridStyle}>
        <div style={detailItemStyle}>
          <span style={detailLabelStyle}>Insurer</span>
          <span style={detailValueStyle}>{insurer}</span>
        </div>
        <div style={detailItemStyle}>
          <span style={detailLabelStyle}>Asset ID</span>
          <span style={detailValueStyle}>{assetId}</span>
        </div>
        <div style={detailItemStyle}>
          <span style={detailLabelStyle}>Coverage</span>
          <span style={detailValueStyle}>${parseFloat(coverageAmount).toLocaleString()}</span>
        </div>
        <div style={detailItemStyle}>
          <span style={detailLabelStyle}>Premium</span>
          <span style={detailValueStyle}>${parseFloat(premium).toLocaleString()}</span>
        </div>
        <div style={detailItemStyle}>
          <span style={detailLabelStyle}>Metric</span>
          <span style={detailValueStyle}>{parametricData.metricName}</span>
        </div>
        <div style={detailItemStyle}>
          <span style={detailLabelStyle}>Trigger Condition</span>
          <span style={detailValueStyle}>{`${parametricData.comparison} ${parametricData.triggerThreshold}`}</span>
        </div>
      </div>
    </div>
  );
};


export const PolicyView: React.FC = () => {
  const { party } = useDamlLedger();

  const policies = useStreamQueries(Policy, () => [{ policyholder: party }]);
  const claims = useStreamQueries(Claim, () => [{ policyholder: party }]);
  const payouts = useStreamQueries(Payout, () => [{ receiver: party }]);

  const claimsMap = React.useMemo(() =>
    new Map(claims.contracts.map(c => [c.payload.policyId, c])),
    [claims.contracts]
  );

  const payoutsMap = React.useMemo(() =>
    new Map(payouts.contracts.map(c => [c.payload.policyId, c])),
    [payouts.contracts]
  );

  const getPolicyStatus = (policyId: string): PolicyStatus => {
    if (payoutsMap.has(policyId)) {
      return 'Paid';
    }
    if (claimsMap.has(policyId)) {
      return 'Triggered';
    }
    return 'Active';
  };

  if (policies.loading || claims.loading || payouts.loading) {
    return <div>Loading your policies...</div>;
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: '#343a40', borderBottom: '2px solid #343a40', paddingBottom: '10px' }}>
        My Insurance Policies
      </h1>
      {policies.contracts.length === 0 ? (
        <p style={{ marginTop: '20px', color: '#6c757d', fontSize: '1.1em' }}>
          You do not have any active insurance policies.
        </p>
      ) : (
        <div>
          {policies.contracts.map(policy => (
            <PolicyCard
              key={policy.contractId}
              policy={policy}
              status={getPolicyStatus(policy.payload.policyId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
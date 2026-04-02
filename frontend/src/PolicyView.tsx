import React, { useState, useEffect } from 'react';
import { getPolicies, getTriggeredEvents, getPayouts, Policy, TriggeredEvent, PayoutReceipt } from './insuranceService';
import './PolicyView.css';

const PolicyView: React.FC = () => {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [triggeredEvents, setTriggeredEvents] = useState<TriggeredEvent[]>([]);
    const [payouts, setPayouts] = useState<PayoutReceipt[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [policiesData, eventsData, payoutsData] = await Promise.all([
                    getPolicies(),
                    getTriggeredEvents(),
                    getPayouts(),
                ]);

                setPolicies(policiesData);
                setTriggeredEvents(eventsData);
                setPayouts(payoutsData);

            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError("Could not load data from the ledger. Please ensure the JSON API is running and you are properly authenticated.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
        
        // Optional: Set up polling to refresh data periodically
        const interval = setInterval(fetchDashboardData, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);

    }, []);

    if (loading) {
        return <div className="loading-container">Loading Policies...</div>;
    }

    if (error) {
        return <div className="error-container">{error}</div>;
    }

    const getPolicyStatus = (policyCid: string): string => {
        const hasBeenPaid = payouts.some(p => p.template.policyId === policies.find(pol => pol.contractId === policyCid)?.template.policyId);
        if (hasBeenPaid) {
            return "Paid Out";
        }
        const hasTriggered = triggeredEvents.some(e => e.template.policyCid === policyCid);
        if (hasTriggered) {
            return "Claim Triggered";
        }
        return "Active";
    }
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    }

    return (
        <div className="policy-view-container">
            <h1>My Insurance Dashboard</h1>

            <section className="dashboard-section">
                <h2>Active Policies</h2>
                {policies.length === 0 ? (
                    <p>No active policies found.</p>
                ) : (
                    <div className="card-grid">
                        {policies.map(policy => (
                            <div key={policy.contractId} className="card policy-card">
                                <div className="card-header">
                                    <h3>Policy: {policy.template.policyId}</h3>
                                    <span className={`status-badge status-${getPolicyStatus(policy.contractId).toLowerCase().replace(' ', '-')}`}>
                                        {getPolicyStatus(policy.contractId)}
                                    </span>
                                </div>
                                <div className="card-body">
                                    <p><strong>Description:</strong> {policy.template.description}</p>
                                    <p><strong>Trigger Condition:</strong> {policy.template.triggerCondition}</p>
                                    <p><strong>Payout Amount:</strong> {policy.template.payoutAmount}</p>
                                    <p><strong>Premium:</strong> {policy.template.premium}</p>
                                    <p><strong>Effective:</strong> {formatDate(policy.template.effectiveDate)}</p>
                                    <p><strong>Expires:</strong> {formatDate(policy.template.expiryDate)}</p>
                                    <p><strong>Insurer:</strong> {policy.template.insurer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="dashboard-section">
                <h2>Triggered Claim Events</h2>
                 {triggeredEvents.length === 0 ? (
                    <p>No triggered claim events.</p>
                ) : (
                    <div className="card-grid">
                        {triggeredEvents.map(event => (
                            <div key={event.contractId} className="card event-card">
                                 <div className="card-header">
                                    <h3>Event Triggered</h3>
                                </div>
                                <div className="card-body">
                                    <p><strong>Policy Contract ID:</strong> <small>{event.template.policyCid}</small></p>
                                    <p><strong>Event Data:</strong> {event.template.eventData}</p>
                                    <p><strong>Timestamp:</strong> {new Date(event.template.eventTimestamp).toLocaleString()}</p>
                                    <p><strong>Oracle:</strong> {event.template.oracle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                 )}
            </section>

            <section className="dashboard-section">
                <h2>Payout History</h2>
                {payouts.length === 0 ? (
                     <p>No payout history found.</p>
                ) : (
                    <table className="payout-table">
                        <thead>
                            <tr>
                                <th>Policy ID</th>
                                <th>Payout Amount</th>
                                <th>Payout Date</th>
                                <th>Insurer</th>
                                <th>Contract ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payouts.map(payout => (
                                <tr key={payout.contractId}>
                                    <td>{payout.template.policyId}</td>
                                    <td>{payout.template.payoutAmount}</td>
                                    <td>{formatDate(payout.template.payoutDate)}</td>
                                    <td>{payout.template.insurer}</td>
                                    <td><small>{payout.contractId}</small></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
};

// Basic CSS for the component - in a real app, this would be in a separate .css file.
const styles = `
.policy-view-container {
    font-family: sans-serif;
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    color: #333;
}
.dashboard-section {
    margin-bottom: 40px;
}
h1, h2 {
    color: #1a237e;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 10px;
}
.loading-container, .error-container {
    text-align: center;
    padding: 50px;
    font-size: 1.2em;
}
.error-container {
    color: #c62828;
    background-color: #ffebee;
    border: 1px solid #c62828;
    border-radius: 8px;
}
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}
.card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    overflow: hidden;
    transition: transform 0.2s;
}
.card:hover {
    transform: translateY(-5px);
}
.card-header {
    background-color: #f5f5f5;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e0e0e0;
}
.card-header h3 {
    margin: 0;
    font-size: 1.1em;
}
.card-body {
    padding: 15px;
}
.card-body p {
    margin: 0 0 10px;
    line-height: 1.5;
}
.card-body p:last-child {
    margin-bottom: 0;
}
.card-body small {
    word-break: break-all;
    color: #666;
}
.status-badge {
    padding: 5px 10px;
    border-radius: 12px;
    font-size: 0.8em;
    font-weight: bold;
    color: #fff;
}
.status-active { background-color: #1e88e5; }
.status-claim-triggered { background-color: #fbc02d; color: #333 }
.status-paid-out { background-color: #43a047; }
.payout-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
}
.payout-table th, .payout-table td {
    padding: 12px;
    border: 1px solid #e0e0e0;
    text-align: left;
}
.payout-table th {
    background-color: #f5f5f5;
    font-weight: bold;
}
.payout-table tbody tr:nth-child(even) {
    background-color: #fafafa;
}
`;

// Inject styles into the document head
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);


export default PolicyView;
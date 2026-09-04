import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft, ArrowUpRight, Send, UserPlus, CreditCard, Shield,
  PieChart, FileText, Settings, Building, ChevronRight, Download, Filter, Home, DollarSign, Briefcase, Search
} from "lucide-react";
import { useCurrentUser } from "../../hooks/CurrentUserContext";
import { useActionRecorder } from "../../hooks/useActionRecorder";
import { useMockData } from "../../hooks/useMockData";
import { api } from "../../services/api";
import ActivityToast from "../../components/ActivityToast";

import "./finance.css";

type Tab = "dashboard" | "transactions" | "transfer" | "cards" | "statements" | "settings";

export default function Finance() {
  const { currentUser } = useCurrentUser();
  const { record, feedback } = useActionRecorder("finance");
  
  const [tab, setTab] = useState<Tab>("dashboard");
  
  // Transfer wizard state
  const [transferStep, setTransferStep] = useState<1 | 2 | 3 | 4>(1);
  const [transferFrom, setTransferFrom] = useState("checking");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  
  // Beneficiary state
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);
  const [newBeneName, setNewBeneName] = useState("");
  const [newBeneAcct, setNewBeneAcct] = useState("");

  const { data, updateData, loading, refresh } = useMockData<{transactions: any[], beneficiaries: any[]}>("finance", { transactions: [], beneficiaries: [] });
  const transactions = data.transactions;
  const beneficiaries = data.beneficiaries;
  
  const checkingBalance = useMemo(() => 42000 + transactions.reduce((s, t) => s + (t.isCredit ? t.amount : -t.amount), 0), [transactions]);
  const savingsBalance = useMemo(() => 125000, []);
  const creditBalance = useMemo(() => 1450.23, []);

  useEffect(() => {
    if (currentUser) record({ event_type: "LOGIN", action: "LOGIN" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  useEffect(() => {
    if (tab === "transactions") record({ event_type: "TRANSACTION_VIEW", action: "TRANSACTION_VIEW", resource_type: "transaction", resource_sensitivity: "CONFIDENTIAL" });
    if (tab === "dashboard") record({ event_type: "ACCOUNT_VIEW", action: "ACCOUNT_VIEW", resource_type: "account", resource_sensitivity: "CONFIDENTIAL" });
    if (tab === "statements") record({ event_type: "ACCOUNT_VIEW", action: "ACCOUNT_VIEW", resource_type: "statement", resource_sensitivity: "RESTRICTED" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  if (!currentUser) return null;

  return (
    <div className="fin-app">
      {/* Sidebar Navigation */}
      <div className="fin-sidebar">
        <div className="fin-logo">
          <Building size={28} className="fin-logo-icon" />
          <span className="fin-logo-text">Northwind Bank</span>
        </div>
        
        <div className="fin-nav-group" style={{ flex: 1 }}>
          <NavItem icon={<Home size={20}/>} label="Dashboard" active={tab === "dashboard"} onClick={() => setTab("dashboard")} />
          <NavItem icon={<FileText size={20}/>} label="Transactions" active={tab === "transactions"} onClick={() => setTab("transactions")} />
          <NavItem icon={<Send size={20}/>} label="Transfer & Pay" active={tab === "transfer"} onClick={() => setTab("transfer")} />
          <NavItem icon={<CreditCard size={20}/>} label="Cards" active={tab === "cards"} onClick={() => setTab("cards")} />
          <NavItem icon={<Download size={20}/>} label="Statements" active={tab === "statements"} onClick={() => setTab("statements")} />
        </div>
        
        <div className="fin-nav-group" style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
          <NavItem icon={<Settings size={20}/>} label="Settings" active={tab === "settings"} onClick={() => setTab("settings")} />
        </div>
      </div>

      {/* Main Content */}
      <div className="fin-main">
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div className="fin-header">
            <div>
              <h1 className="fin-title">Welcome back, {currentUser.name.split(" ")[0]}</h1>
              <p className="fin-subtitle">Here's your financial summary for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
            {tab === "dashboard" && (
              <button className="fin-btn" onClick={() => setTab("transfer")}>
                <Send size={16}/> Quick Transfer
              </button>
            )}
          </div>

          {tab === "dashboard" && (
            <div className="fin-dashboard-grid">
              {/* Account Cards */}
              <AccountCard 
                type="Checking Account" 
                number="4471" 
                balance={checkingBalance} 
                icon={<DollarSign size={24}/>} 
                colorClass="blue" 
              />
              <AccountCard 
                type="Savings Account" 
                number="8832" 
                balance={savingsBalance} 
                icon={<Briefcase size={24}/>} 
                colorClass="emerald" 
              />
              <AccountCard 
                type="Credit Card" 
                number="1092" 
                balance={creditBalance} 
                icon={<CreditCard size={24}/>} 
                colorClass="indigo" 
                isCredit 
              />

              {/* Spending Chart Mock */}
              <div className="fin-panel" style={{ gridColumn: "1 / -1" }}>
                <div className="fin-panel-header">
                  <h3 className="fin-panel-title"><PieChart size={20}/> Spending Overview</h3>
                  <select style={{ background: 'transparent', border: 'none', color: '#64748b', outline: 'none' }}>
                    <option>This Month</option>
                    <option>Last Month</option>
                  </select>
                </div>
                <div className="fin-chart-container">
                  {[45, 70, 30, 90, 60, 40, 85].map((h, i) => (
                    <div key={i} className="fin-bar-group" style={{ height: `${h}%` }}>
                      <div className="fin-bar-fill"></div>
                      <div className="fin-bar-label">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="fin-panel" style={{ gridColumn: "1 / -1" }}>
                <div className="fin-panel-header">
                  <h3 className="fin-panel-title">Recent Activity</h3>
                  <button className="fin-link" onClick={() => setTab("transactions")}>View all</button>
                </div>
                <div className="fin-tx-list">
                  {transactions.slice(0, 4).map(t => (
                    <div key={t.id} className="fin-tx-item">
                      <div className="fin-tx-left">
                        <div className={`fin-tx-icon ${t.isCredit ? 'credit' : 'debit'}`}>
                          {t.isCredit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                        </div>
                        <div className="fin-tx-merchant">{t.merchant}</div>
                      </div>
                      <div className={`fin-tx-amount ${t.isCredit ? 'credit' : ''}`}>
                        {t.isCredit ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "transactions" && (
            <div className="fin-table-container">
              <div className="fin-table-toolbar">
                <div style={{ position: 'relative' }}>
                  <input placeholder="Search transactions..." className="fin-search-input" />
                  <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: '#94a3b8' }} />
                </div>
                <button className="fin-btn fin-btn-ghost"><Filter size={16}/> Filter</button>
              </div>
              <table className="fin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Account</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id}>
                      <td style={{ color: '#64748b' }}>{formatDate(t.timestamp).split(',')[0]}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600 }}>
                          <div className={`fin-tx-icon ${t.isCredit ? 'credit' : 'debit'}`} style={{ width: 28, height: 28 }}>
                            {t.isCredit ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                          </div>
                          {t.merchant}
                        </div>
                      </td>
                      <td style={{ color: '#64748b' }}>Checking ··4471</td>
                      <td className={`fin-tx-amount ${t.isCredit ? 'credit' : ''}`} style={{ textAlign: 'right' }}>
                        {t.isCredit ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "transfer" && (
            <div className="fin-wizard-container">
              <div className="fin-wizard-header">
                {[1, 2, 3, 4].map(step => (
                  <div key={step} className={`fin-wizard-step-tab ${transferStep >= step ? 'active' : ''}`}>
                    Step {step}
                  </div>
                ))}
              </div>

              <div className="fin-wizard-body">
                {transferStep === 1 && (
                  <div>
                    <h2 className="fin-wizard-title">Select from account</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className={`fin-selectable-card ${transferFrom === 'checking' ? 'selected' : ''}`} onClick={() => setTransferFrom('checking')}>
                        <div>
                          <div className="fin-sc-title">Checking Account</div>
                          <div className="fin-sc-subtitle">•••• 4471</div>
                        </div>
                        <div className="fin-sc-amount">${checkingBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                      </div>
                      <div className={`fin-selectable-card ${transferFrom === 'savings' ? 'selected' : ''}`} onClick={() => setTransferFrom('savings')}>
                        <div>
                          <div className="fin-sc-title">Savings Account</div>
                          <div className="fin-sc-subtitle">•••• 8832</div>
                        </div>
                        <div className="fin-sc-amount">${savingsBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                      <button className="fin-btn" onClick={() => setTransferStep(2)}>Continue</button>
                    </div>
                  </div>
                )}

                {transferStep === 2 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <h2 className="fin-wizard-title" style={{ margin: 0 }}>Select recipient</h2>
                      <button className="fin-btn fin-btn-ghost" onClick={() => setShowAddBeneficiary(!showAddBeneficiary)}>
                        <UserPlus size={16}/> Add new
                      </button>
                    </div>

                    {showAddBeneficiary && (
                      <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '20px', background: '#f8f9fc' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <input value={newBeneName} onChange={(e) => setNewBeneName(e.target.value)} placeholder="Recipient Name" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                          <input value={newBeneAcct} onChange={(e) => setNewBeneAcct(e.target.value)} placeholder="Account Number" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                            <button className="fin-btn fin-btn-ghost" onClick={() => setShowAddBeneficiary(false)}>Cancel</button>
                            <button 
                              className="fin-btn"
                              disabled={!newBeneName || !newBeneAcct}
                              onClick={() => {
                                const id = `bene-new-${Date.now()}`;
                                record({ event_type: "BENEFICIARY_ADD", action: "BENEFICIARY_ADD", resource_type: "beneficiary", resource_id: id, resource_sensitivity: "RESTRICTED" });
                                const newBene = { id, name: newBeneName, accountNumber: `••••${newBeneAcct.slice(-4)}` };
                                updateData({ ...data, beneficiaries: [...beneficiaries, newBene] });
                                setTransferTo(id);
                                setNewBeneName(""); setNewBeneAcct("");
                                setShowAddBeneficiary(false);
                              }}
                            >Save Beneficiary</button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                      {beneficiaries.map(b => (
                        <div key={b.id} className={`fin-selectable-card ${transferTo === b.id ? 'selected' : ''}`} onClick={() => setTransferTo(b.id)} style={{ marginBottom: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#64748b' }}>
                              {b.name.charAt(0)}
                            </div>
                            <div>
                              <div className="fin-sc-title">{b.name}</div>
                              <div className="fin-sc-subtitle">{b.accountNumber}</div>
                            </div>
                          </div>
                          {transferTo === b.id && <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#2563eb' }}></div>}
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                      <button className="fin-btn fin-btn-ghost" onClick={() => setTransferStep(1)}>Back</button>
                      <button className="fin-btn" disabled={!transferTo} onClick={() => setTransferStep(3)}>Continue</button>
                    </div>
                  </div>
                )}

                {transferStep === 3 && (
                  <div>
                    <h2 className="fin-wizard-title">Enter amount</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '48px', fontWeight: 800, color: '#94a3b8' }}>$</span>
                        <input 
                          type="number" 
                          value={transferAmount} 
                          onChange={(e) => setTransferAmount(e.target.value)} 
                          placeholder="0.00"
                          className="fin-input-large"
                          autoFocus
                        />
                      </div>
                      <div style={{ color: '#64748b', marginTop: '16px', fontWeight: 500 }}>
                        Available: ${transferFrom === 'checking' ? checkingBalance.toLocaleString() : savingsBalance.toLocaleString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                      <button className="fin-btn fin-btn-ghost" onClick={() => setTransferStep(2)}>Back</button>
                      <button className="fin-btn" disabled={!transferAmount || Number(transferAmount) <= 0} onClick={() => setTransferStep(4)}>Review Transfer</button>
                    </div>
                  </div>
                )}

                {transferStep === 4 && (
                  <div>
                    <h2 className="fin-wizard-title">Review and confirm</h2>
                    
                    <div className="fin-wizard-summary">
                      <div className="fin-summary-row">
                        <span className="fin-sr-label">Amount</span>
                        <span className="fin-sr-val text-2xl font-bold">${Number(transferAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="fin-summary-row">
                        <span className="fin-sr-label">From</span>
                        <span className="fin-sr-val" style={{ textTransform: 'capitalize' }}>{transferFrom} Account</span>
                      </div>
                      <div className="fin-summary-row">
                        <span className="fin-sr-label">To</span>
                        <span className="fin-sr-val">{beneficiaries.find(b => b.id === transferTo)?.name}</span>
                      </div>
                      <div className="fin-summary-row">
                        <span className="fin-sr-label">Date</span>
                        <span className="fin-sr-val">Today</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                      <button className="fin-btn fin-btn-ghost" onClick={() => setTransferStep(3)}>Back</button>
                      <button className="fin-btn" onClick={() => {
                        record({ 
                          event_type: "TRANSFER_CREATE", 
                          action: "TRANSFER_CREATE", 
                          resource_type: "transfer", 
                          resource_id: `transfer-${Date.now()}`, 
                          resource_sensitivity: "RESTRICTED", 
                          metadata: { amount: Number(transferAmount), to: transferTo } 
                        });
                        
                        const newTx = {
                          id: `tx-${Date.now()}`,
                          merchant: `Transfer to ${beneficiaries.find(b => b.id === transferTo)?.name}`,
                          amount: Number(transferAmount),
                          isCredit: false,
                          timestamp: new Date().toISOString()
                        };
                        updateData({ ...data, transactions: [newTx, ...transactions] });

                        // Reset wizard
                        setTimeout(() => {
                          setTransferStep(1);
                          setTransferTo("");
                          setTransferAmount("");
                          setTab("dashboard");
                        }, 1000);
                      }}>Confirm Transfer</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "cards" && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', maxWidth: '900px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <AccountCard 
                  type="Debit Card" 
                  number="4471" 
                  balance={checkingBalance} 
                  icon={<Shield size={24}/>} 
                  colorClass="blue" 
                />
                <div className="fin-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button className="fin-btn fin-btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => record({ event_type: "PROFILE_CHANGE", action: "FREEZE_CARD", resource_type: "card", metadata: { card: "4471" } })}>
                    Freeze Card
                  </button>
                  <button className="fin-btn fin-btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => record({ event_type: "PROFILE_CHANGE", action: "REPORT_LOST", resource_type: "card", metadata: { card: "4471" } })}>
                    Report Lost or Stolen
                  </button>
                  <button className="fin-btn fin-btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => record({ event_type: "SETTINGS_CHANGE", action: "PIN_CHANGE", resource_type: "card", metadata: { card: "4471" } })}>
                    Change PIN
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <AccountCard 
                  type="Credit Card" 
                  number="1092" 
                  balance={creditBalance} 
                  icon={<Shield size={24}/>} 
                  colorClass="indigo" 
                  isCredit
                />

                <div className="fin-panel">
                  <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Current Balance</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: '24px' }}>${creditBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  
                  <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '4px' }}>Available Credit</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '32px' }}>${(10000 - creditBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  
                  <button className="fin-btn" style={{ width: '100%', justifyContent: 'center' }}>Pay Credit Card Bill</button>
                </div>
              </div>
            </div>
          )}

          {tab === "statements" && (
            <div className="fin-panel" style={{ maxWidth: '800px' }}>
              <h2 className="fin-panel-title" style={{ fontSize: '24px', marginBottom: '24px' }}>Account Statements</h2>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {Array.from({ length: 12 }).map((_, i) => {
                  const d = new Date();
                  d.setMonth(d.getMonth() - i - 1);
                  const monthStr = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={24} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '16px' }}>Statement - {monthStr}</div>
                          <div style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>PDF Document • 45 KB</div>
                        </div>
                      </div>
                      <button className="fin-btn fin-btn-ghost" onClick={() => record({ 
                        event_type: "CONTENT_DOWNLOAD",
                        action: "STATEMENT_DOWNLOAD", 
                        resource_type: "statement", 
                        resource_id: `stmt-${monthStr.replace(' ', '-')}`,
                        resource_sensitivity: "RESTRICTED",
                        data_volume: 45
                      })}>
                        <Download size={16}/> Download
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "settings" && (
            <div className="fin-panel fin-settings-panel">
              <h2 className="fin-panel-title" style={{ fontSize: '24px', marginBottom: '32px' }}>Security Settings</h2>
              
              <div className="fin-settings-group">
                <h3>Profile Details</h3>
                <button className="fin-btn fin-btn-ghost" onClick={() => record({ event_type: "PROFILE_CHANGE", action: "PROFILE_CHANGE", resource_type: "profile" })}>
                  Update Contact Information
                </button>
              </div>
              
              <div className="fin-settings-group" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '32px' }}>
                <h3>Device & Login History</h3>
                <p>
                  As part of our commitment to security, device and login histories are monitored centrally. 
                  If you do not recognize an activity, please check the Security Center.
                </p>
                <button className="fin-btn fin-btn-ghost" onClick={() => window.open('/security/overview', '_blank')}>
                  Open Security Center
                </button>
              </div>

              <div className="fin-settings-group" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '32px' }}>
                <h3 style={{ color: '#ef4444' }}>Reset Mock Data</h3>
                <p>
                  Reset all apps back to their initial static data state.
                </p>
                <button className="fin-btn fin-btn-ghost" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={async () => {
                  await api.post('/mock/reset');
                  refresh();
                }}>
                  Reset App Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ActivityToast feedback={feedback} />
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`fin-nav-item ${active ? 'active' : ''}`}
    >
      {icon}
      <span>{label}</span>
      <ChevronRight size={16} className="fin-nav-chevron" />
    </button>
  );
}

function AccountCard({ type, number, balance, icon, colorClass, isCredit }: { type: string, number: string, balance: number, icon: React.ReactNode, colorClass: string, isCredit?: boolean }) {
  return (
    <div className={`fin-account-card ${colorClass}`}>
      <div className="fin-acct-header">
        <div>
          <div className="fin-acct-type">{type}</div>
          <div className="fin-acct-num">•••• {number}</div>
        </div>
        <div className="fin-acct-icon">
          {icon}
        </div>
      </div>
      <div className="fin-acct-footer">
        <div className="fin-acct-label">{isCredit ? 'Current Balance' : 'Available Balance'}</div>
        <div className="fin-acct-balance">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </div>
    </div>
  );
}

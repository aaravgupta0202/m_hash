import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft, ArrowUpRight, Send, UserPlus, CreditCard, Shield,
  PieChart, FileText, Settings, Building, ChevronRight, Download, Filter, Home, DollarSign, Briefcase, Search
} from "lucide-react";
import { useCurrentUser } from "../../hooks/CurrentUserContext";
import { useActionRecorder } from "../../hooks/useActionRecorder";
import { generateBeneficiaries, generateTransactions } from "../../data/mockContent";
import ActivityToast from "../../components/ActivityToast";
import { Button } from "../../components/ui";
import { formatDate } from "../../lib/style";

type Tab = "dashboard" | "transactions" | "transfer" | "cards" | "statements" | "settings";

export default function Finance() {
  const { currentUser } = useCurrentUser();
  const { record, feedback } = useActionRecorder("finance");
  
  const [tab, setTab] = useState<Tab>("dashboard");
  const [addedBeneficiaries, setAddedBeneficiaries] = useState<{ id: string; name: string; accountNumber: string }[]>([]);
  
  // Transfer wizard state
  const [transferStep, setTransferStep] = useState<1 | 2 | 3 | 4>(1);
  const [transferFrom, setTransferFrom] = useState("checking");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  
  // Beneficiary state
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);
  const [newBeneName, setNewBeneName] = useState("");
  const [newBeneAcct, setNewBeneAcct] = useState("");

  const transactions = useMemo(() => (currentUser ? generateTransactions(currentUser) : []), [currentUser]);
  const beneficiaries = useMemo(
    () => (currentUser ? [...generateBeneficiaries(currentUser), ...addedBeneficiaries] : []),
    [currentUser, addedBeneficiaries]
  );
  
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
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 dark:bg-[#121212]">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r bg-white dark:bg-[#1a1a1a] flex flex-col py-6 px-4 shrink-0" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 px-2 mb-10 text-blue-900 dark:text-blue-400">
          <Building size={28} />
          <span className="text-xl font-bold tracking-tight">Northwind Bank</span>
        </div>
        
        <div className="flex flex-col gap-1 flex-1">
          <NavItem icon={<Home size={20}/>} label="Dashboard" active={tab === "dashboard"} onClick={() => setTab("dashboard")} />
          <NavItem icon={<FileText size={20}/>} label="Transactions" active={tab === "transactions"} onClick={() => setTab("transactions")} />
          <NavItem icon={<Send size={20}/>} label="Transfer & Pay" active={tab === "transfer"} onClick={() => setTab("transfer")} />
          <NavItem icon={<CreditCard size={20}/>} label="Cards" active={tab === "cards"} onClick={() => setTab("cards")} />
          <NavItem icon={<Download size={20}/>} label="Statements" active={tab === "statements"} onClick={() => setTab("statements")} />
        </div>
        
        <div className="flex flex-col gap-1 border-t pt-4" style={{ borderColor: "var(--border)" }}>
          <NavItem icon={<Settings size={20}/>} label="Settings" active={tab === "settings"} onClick={() => setTab("settings")} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">
          
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--text)" }}>Welcome back, {currentUser.name.split(" ")[0]}</h1>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Here's your financial summary for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
            {tab === "dashboard" && (
              <Button onClick={() => setTab("transfer")}><span className="flex items-center gap-2"><Send size={16}/> Quick Transfer</span></Button>
            )}
          </div>

          {tab === "dashboard" && (
            <div className="flex flex-col gap-8">
              {/* Account Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AccountCard 
                  type="Checking" 
                  number="4471" 
                  balance={checkingBalance} 
                  icon={<DollarSign />} 
                  color="bg-blue-600" 
                />
                <AccountCard 
                  type="Savings" 
                  number="8832" 
                  balance={savingsBalance} 
                  icon={<Briefcase />} 
                  color="bg-emerald-600" 
                />
                <AccountCard 
                  type="Credit Card" 
                  number="1092" 
                  balance={-creditBalance} 
                  icon={<CreditCard />} 
                  color="bg-indigo-600" 
                  isCredit 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Spending Chart Mock */}
                <div className="md:col-span-2 rounded-2xl p-6 bg-white dark:bg-[#1a1a1a] border shadow-sm" style={{ borderColor: "var(--border)" }}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold flex items-center gap-2"><PieChart size={18}/> Spending Overview</h3>
                    <select className="text-sm border-none bg-transparent outline-none cursor-pointer" style={{ color: "var(--text-muted)" }}>
                      <option>This Month</option>
                      <option>Last Month</option>
                    </select>
                  </div>
                  <div className="h-48 flex items-end justify-between gap-2 px-2">
                    {[45, 70, 30, 90, 60, 40, 85].map((h, i) => (
                      <div key={i} className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-sm relative group cursor-pointer" style={{ height: `${h}%` }}>
                        <div className="absolute inset-0 bg-blue-500 rounded-t-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs" style={{ color: "var(--text-muted)" }}>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="rounded-2xl p-6 bg-white dark:bg-[#1a1a1a] border shadow-sm" style={{ borderColor: "var(--border)" }}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold">Recent Activity</h3>
                    <button className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline" onClick={() => setTab("transactions")}>View all</button>
                  </div>
                  <div className="flex flex-col gap-4">
                    {transactions.slice(0, 4).map(t => (
                      <div key={t.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.isCredit ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-gray-100 text-gray-600 dark:bg-gray-800'}`}>
                            {t.isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                          </div>
                          <div>
                            <div className="text-sm font-medium truncate w-24 sm:w-32">{t.merchant}</div>
                          </div>
                        </div>
                        <div className={`text-sm font-bold ${t.isCredit ? 'text-emerald-600' : ''}`}>
                          {t.isCredit ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "transactions" && (
            <div className="rounded-2xl bg-white dark:bg-[#1a1a1a] border shadow-sm flex flex-col h-[calc(100vh-200px)]" style={{ borderColor: "var(--border)" }}>
              <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: "var(--border)" }}>
                <div className="flex gap-2 relative">
                  <input placeholder="Search transactions..." className="pl-9 pr-4 py-2 text-sm rounded-lg border bg-transparent" style={{ borderColor: "var(--border)" }} />
                  <Search size={16} className="absolute left-3 top-2.5" style={{ color: "var(--text-muted)" }} />
                </div>
                <Button variant="secondary"><span className="flex items-center gap-2"><Filter size={16}/> Filter</span></Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-gray-50 dark:bg-[#222] text-xs uppercase" style={{ color: "var(--text-muted)" }}>
                    <tr>
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">Description</th>
                      <th className="px-6 py-3 font-medium">Account</th>
                      <th className="px-6 py-3 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                    {transactions.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-sm">
                        <td className="px-6 py-4 whitespace-nowrap" style={{ color: "var(--text-muted)" }}>{formatDate(t.timestamp).split(',')[0]}</td>
                        <td className="px-6 py-4 font-medium flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${t.isCredit ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-gray-100 text-gray-600 dark:bg-gray-800'}`}>
                            {t.isCredit ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                          </div>
                          {t.merchant}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" style={{ color: "var(--text-muted)" }}>Checking ··4471</td>
                        <td className={`px-6 py-4 text-right font-bold ${t.isCredit ? 'text-emerald-600' : ''}`}>
                          {t.isCredit ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "transfer" && (
            <div className="max-w-2xl mx-auto">
              <div className="rounded-2xl bg-white dark:bg-[#1a1a1a] border shadow-sm overflow-hidden" style={{ borderColor: "var(--border)" }}>
                {/* Wizard Header */}
                <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
                  {[1, 2, 3, 4].map(step => (
                    <div key={step} className={`flex-1 text-center py-3 text-sm font-medium ${transferStep >= step ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-gray-400 border-b-2 border-transparent'}`}>
                      Step {step}
                    </div>
                  ))}
                </div>

                <div className="p-8">
                  {transferStep === 1 && (
                    <div className="flex flex-col gap-6 animate-in slide-in-from-right-4">
                      <h2 className="text-xl font-bold">Select from account</h2>
                      <div className="grid gap-4">
                        <div className={`p-4 border-2 rounded-xl cursor-pointer flex justify-between items-center ${transferFrom === 'checking' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-[var(--border)] hover:border-gray-400'}`} onClick={() => setTransferFrom('checking')}>
                          <div>
                            <div className="font-bold">Checking Account</div>
                            <div className="text-sm" style={{ color: "var(--text-muted)" }}>•••• 4471</div>
                          </div>
                          <div className="font-bold text-lg">${checkingBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        </div>
                        <div className={`p-4 border-2 rounded-xl cursor-pointer flex justify-between items-center ${transferFrom === 'savings' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-[var(--border)] hover:border-gray-400'}`} onClick={() => setTransferFrom('savings')}>
                          <div>
                            <div className="font-bold">Savings Account</div>
                            <div className="text-sm" style={{ color: "var(--text-muted)" }}>•••• 8832</div>
                          </div>
                          <div className="font-bold text-lg">${savingsBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        </div>
                      </div>
                      <div className="flex justify-end mt-4">
                        <Button onClick={() => setTransferStep(2)}>Continue</Button>
                      </div>
                    </div>
                  )}

                  {transferStep === 2 && (
                    <div className="flex flex-col gap-6 animate-in slide-in-from-right-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Select recipient</h2>
                        <Button variant="ghost" onClick={() => setShowAddBeneficiary(!showAddBeneficiary)}>
                          <span className="flex items-center gap-1.5"><UserPlus size={16}/> Add new</span>
                        </Button>
                      </div>

                      {showAddBeneficiary && (
                        <div className="p-4 border rounded-xl bg-gray-50 dark:bg-gray-900 flex flex-col gap-3" style={{ borderColor: "var(--border)" }}>
                          <input value={newBeneName} onChange={(e) => setNewBeneName(e.target.value)} placeholder="Recipient Name" className="p-2 border rounded text-sm bg-white dark:bg-black" style={{ borderColor: "var(--border)" }} />
                          <input value={newBeneAcct} onChange={(e) => setNewBeneAcct(e.target.value)} placeholder="Account Number" className="p-2 border rounded text-sm bg-white dark:bg-black" style={{ borderColor: "var(--border)" }} />
                          <div className="flex justify-end gap-2 mt-2">
                            <Button variant="ghost" onClick={() => setShowAddBeneficiary(false)}>Cancel</Button>
                            <Button 
                              disabled={!newBeneName || !newBeneAcct}
                              onClick={() => {
                                const id = `bene-new-${Date.now()}`;
                                record({ event_type: "BENEFICIARY_ADD", action: "BENEFICIARY_ADD", resource_type: "beneficiary", resource_id: id, resource_sensitivity: "RESTRICTED" });
                                setAddedBeneficiaries((prev) => [...prev, { id, name: newBeneName, accountNumber: `••••${newBeneAcct.slice(-4)}` }]);
                                setTransferTo(id);
                                setNewBeneName(""); setNewBeneAcct("");
                                setShowAddBeneficiary(false);
                              }}
                            >Save Beneficiary</Button>
                          </div>
                        </div>
                      )}

                      <div className="grid gap-3 max-h-64 overflow-y-auto pr-2">
                        {beneficiaries.map(b => (
                          <div key={b.id} className={`p-4 border-2 rounded-xl cursor-pointer flex justify-between items-center ${transferTo === b.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-[var(--border)] hover:border-gray-400'}`} onClick={() => setTransferTo(b.id)}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500 dark:text-gray-400">{b.name.charAt(0)}</div>
                              <div>
                                <div className="font-bold">{b.name}</div>
                                <div className="text-sm" style={{ color: "var(--text-muted)" }}>{b.accountNumber}</div>
                              </div>
                            </div>
                            {transferTo === b.id && <div className="w-4 h-4 rounded-full bg-blue-600 shrink-0"></div>}
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between mt-4">
                        <Button variant="ghost" onClick={() => setTransferStep(1)}>Back</Button>
                        <Button disabled={!transferTo} onClick={() => setTransferStep(3)}>Continue</Button>
                      </div>
                    </div>
                  )}

                  {transferStep === 3 && (
                    <div className="flex flex-col gap-6 animate-in slide-in-from-right-4">
                      <h2 className="text-xl font-bold">Enter amount</h2>
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="text-5xl font-bold text-center flex items-center justify-center">
                          <span style={{ color: "var(--text-muted)" }}>$</span>
                          <input 
                            type="number" 
                            value={transferAmount} 
                            onChange={(e) => setTransferAmount(e.target.value)} 
                            placeholder="0.00"
                            className="bg-transparent border-none outline-none w-48 text-center ml-2"
                            autoFocus
                          />
                        </div>
                        <div className="text-sm mt-4" style={{ color: "var(--text-muted)" }}>Available: ${transferFrom === 'checking' ? checkingBalance.toLocaleString() : savingsBalance.toLocaleString()}</div>
                      </div>

                      <div className="flex justify-between mt-4">
                        <Button variant="ghost" onClick={() => setTransferStep(2)}>Back</Button>
                        <Button disabled={!transferAmount || Number(transferAmount) <= 0} onClick={() => setTransferStep(4)}>Review Transfer</Button>
                      </div>
                    </div>
                  )}

                  {transferStep === 4 && (
                    <div className="flex flex-col gap-6 animate-in slide-in-from-right-4">
                      <h2 className="text-xl font-bold">Review and confirm</h2>
                      
                      <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-900 border" style={{ borderColor: "var(--border)" }}>
                        <div className="flex justify-between py-3 border-b" style={{ borderColor: "var(--border)" }}>
                          <span style={{ color: "var(--text-muted)" }}>Amount</span>
                          <span className="font-bold text-lg">${Number(transferAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between py-3 border-b" style={{ borderColor: "var(--border)" }}>
                          <span style={{ color: "var(--text-muted)" }}>From</span>
                          <span className="font-medium capitalize">{transferFrom} Account</span>
                        </div>
                        <div className="flex justify-between py-3 border-b" style={{ borderColor: "var(--border)" }}>
                          <span style={{ color: "var(--text-muted)" }}>To</span>
                          <span className="font-medium">{beneficiaries.find(b => b.id === transferTo)?.name}</span>
                        </div>
                        <div className="flex justify-between py-3">
                          <span style={{ color: "var(--text-muted)" }}>Date</span>
                          <span className="font-medium">Today</span>
                        </div>
                      </div>

                      <div className="flex justify-between mt-4">
                        <Button variant="ghost" onClick={() => setTransferStep(3)}>Back</Button>
                        <Button onClick={() => {
                          record({ 
                            event_type: "TRANSFER_CREATE", 
                            action: "TRANSFER_CREATE", 
                            resource_type: "transfer", 
                            resource_id: `transfer-${Date.now()}`, 
                            resource_sensitivity: "RESTRICTED", 
                            metadata: { amount: Number(transferAmount), to: transferTo } 
                          });
                          // Reset wizard
                          setTimeout(() => {
                            setTransferStep(1);
                            setTransferTo("");
                            setTransferAmount("");
                            setTab("dashboard");
                          }, 1000);
                        }}>Confirm Transfer</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === "cards" && (
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
              <div className="flex flex-col gap-6">
                <div className="h-48 rounded-2xl p-6 flex flex-col justify-between shadow-lg text-white" style={{ background: "linear-gradient(135deg, #1e3a8a, #3b82f6)" }}>
                  <div className="flex justify-between items-start">
                    <span className="font-medium tracking-widest uppercase">Debit</span>
                    <Shield size={24} />
                  </div>
                  <div>
                    <div className="font-mono text-xl tracking-[0.2em] mb-2">**** **** **** 4471</div>
                    <div className="flex justify-between">
                      <span className="font-medium">{currentUser.name}</span>
                      <span className="font-mono">12/28</span>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-xl border p-4 bg-white dark:bg-[#1a1a1a] flex flex-col gap-2" style={{ borderColor: "var(--border)" }}>
                  <Button variant="secondary" onClick={() => record({ event_type: "PROFILE_CHANGE", action: "FREEZE_CARD", resource_type: "card", metadata: { card: "4471" } })}>
                    Freeze Card
                  </Button>
                  <Button variant="secondary" onClick={() => record({ event_type: "PROFILE_CHANGE", action: "REPORT_LOST", resource_type: "card", metadata: { card: "4471" } })}>
                    Report Lost or Stolen
                  </Button>
                  <Button variant="secondary" onClick={() => record({ event_type: "SETTINGS_CHANGE", action: "PIN_CHANGE", resource_type: "card", metadata: { card: "4471" } })}>
                    Change PIN
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="h-48 rounded-2xl p-6 flex flex-col justify-between shadow-lg text-white" style={{ background: "linear-gradient(135deg, #3730a3, #6366f1)" }}>
                  <div className="flex justify-between items-start">
                    <span className="font-medium tracking-widest uppercase">Credit</span>
                    <Shield size={24} />
                  </div>
                  <div>
                    <div className="font-mono text-xl tracking-[0.2em] mb-2">**** **** **** 1092</div>
                    <div className="flex justify-between">
                      <span className="font-medium">{currentUser.name}</span>
                      <span className="font-mono">08/29</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border p-6 bg-white dark:bg-[#1a1a1a]" style={{ borderColor: "var(--border)" }}>
                  <div className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>Current Balance</div>
                  <div className="text-2xl font-bold mb-4">${creditBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  
                  <div className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>Available Credit</div>
                  <div className="text-lg font-bold mb-6">${(10000 - creditBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  
                  <Button className="w-full">Pay Credit Card Bill</Button>
                </div>
              </div>
            </div>
          )}

          {tab === "statements" && (
            <div className="max-w-3xl rounded-2xl border bg-white dark:bg-[#1a1a1a] p-6 shadow-sm" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-xl font-bold mb-6">Account Statements</h2>
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {Array.from({ length: 12 }).map((_, i) => {
                  const d = new Date();
                  d.setMonth(d.getMonth() - i - 1);
                  const monthStr = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  return (
                    <div key={i} className="py-4 flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="font-bold">Statement - {monthStr}</div>
                          <div className="text-sm" style={{ color: "var(--text-muted)" }}>PDF Document • 45 KB</div>
                        </div>
                      </div>
                      <Button variant="secondary" onClick={() => record({ 
                        event_type: "CONTENT_DOWNLOAD", // Or ACCOUNT_VIEW as per spec, CONTENT_DOWNLOAD is good for PDF
                        action: "STATEMENT_DOWNLOAD", 
                        resource_type: "statement", 
                        resource_id: `stmt-${monthStr.replace(' ', '-')}`,
                        resource_sensitivity: "RESTRICTED",
                        data_volume: 45
                      })}>
                        <span className="flex items-center gap-2"><Download size={16}/> Download</span>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "settings" && (
            <div className="max-w-2xl rounded-2xl border bg-white dark:bg-[#1a1a1a] p-8 shadow-sm" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-2xl font-bold mb-6">Security Settings</h2>
              
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="font-bold mb-2">Profile Details</h3>
                  <Button variant="secondary" onClick={() => record({ event_type: "PROFILE_CHANGE", action: "PROFILE_CHANGE", resource_type: "profile" })}>
                    Update Contact Information
                  </Button>
                </div>
                
                <div className="border-t pt-6" style={{ borderColor: "var(--border)" }}>
                  <h3 className="font-bold mb-2">Device & Login History</h3>
                  <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                    As part of our commitment to security, device and login histories are monitored centrally. 
                    If you do not recognize an activity, please check the Security Center.
                  </p>
                  <Button variant="secondary" onClick={() => window.open('/security/overview', '_blank')}>
                    Open Security Center
                  </Button>
                </div>
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
      className={`flex items-center gap-3 p-3 rounded-xl transition-all w-full text-left font-medium ${active ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}
    >
      <div className={active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}>{icon}</div>
      <span className="text-sm">{label}</span>
      {active && <ChevronRight size={16} className="ml-auto opacity-50" />}
    </button>
  );
}

function AccountCard({ type, number, balance, icon, color, isCredit }: { type: string, number: string, balance: number, icon: React.ReactNode, color: string, isCredit?: boolean }) {
  return (
    <div className={`${color} rounded-2xl p-6 text-white shadow-lg relative overflow-hidden`}>
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <div className="font-medium text-white/80">{type}</div>
          <div className="text-sm text-white/60">•••• {number}</div>
        </div>
        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
          {icon}
        </div>
      </div>
      <div className="relative z-10">
        <div className="text-sm text-white/80 mb-1">{isCredit ? 'Current Balance' : 'Available Balance'}</div>
        <div className="text-3xl font-bold">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </div>
    </div>
  );
}

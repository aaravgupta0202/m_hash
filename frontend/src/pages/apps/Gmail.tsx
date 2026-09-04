import { useEffect, useMemo, useState } from "react";
import {
  Download, Paperclip, Search, Settings as SettingsIcon,
  Menu, Inbox, Star, Clock, Send as SendIcon, File, AlertCircle,
  MoreVertical, ChevronLeft, ChevronRight, X, User, Edit3, Trash2
} from "lucide-react";
import { useCurrentUser } from "../../hooks/CurrentUserContext";
import { useActionRecorder } from "../../hooks/useActionRecorder";
import { useMockData } from "../../hooks/useMockData";
import { api } from "../../services/api";
import ActivityToast from "../../components/ActivityToast";

import "./gmail.css";

type Tab = "inbox" | "sent" | "drafts" | "settings";
type Category = "primary" | "promotions" | "social";
type Sensitivity = "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";

export default function Gmail() {
  const { currentUser, users } = useCurrentUser();
  const { record, feedback } = useActionRecorder("gmail");
  
  const [tab, setTab] = useState<Tab>("inbox");
  const [category, setCategory] = useState<Category>("primary");
  const [query, setQuery] = useState("");
  const [openEmailId, setOpenEmailId] = useState<string | null>(null);
  
  const [isComposing, setIsComposing] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  
  const [settingsTab, setSettingsTab] = useState<"general" | "forwarding" | "accounts">("general");
  const [forwardTo, setForwardTo] = useState("");
  const [rules, setRules] = useState<string[]>([]);

  const contacts = useMemo(() => users.filter((u) => u.id !== currentUser?.id), [users, currentUser]);
  const { data, updateData, loading, refresh } = useMockData<{emails: any[]}>("gmail", { emails: [] });
  const emails = data.emails;
  const openEmail = emails.find((e) => e.id === openEmailId) ?? null;

  useEffect(() => {
    if (currentUser) record({ event_type: "LOGIN", action: "LOGIN" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  if (!currentUser) return null;

  const runSearch = () => {
    if (!query.trim()) return;
    record({ event_type: "EMAIL_SEARCH", action: "EMAIL_SEARCH", resource_type: "mailbox", metadata: { query, result_count: emails.length } });
  };

  const getSensitivityTier = (sizeKb: number): Sensitivity => {
    if (sizeKb > 500) return "RESTRICTED";
    if (sizeKb > 200) return "CONFIDENTIAL";
    if (sizeKb > 50) return "INTERNAL";
    return "PUBLIC";
  };

  const getAvatarForName = (name: string) => {
    const u = users.find(u => u.name === name);
    return u ? `/images/avatar_${(Number(u.id) % 7) + 1}.jpg` : `/images/avatar_1.jpg`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
    });
  };

  return (
    <div className="mail-app">
      {/* Top Header */}
      <div className="mail-header">
        <div className="mail-logo-area">
          <button className="mail-icon-btn"><Menu size={20} /></button>
          <div className="mail-logo-text">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            Northwind Mail
          </div>
        </div>
        
        <div className="mail-search-area">
          <div className="mail-search-box">
            <button className="mail-icon-btn" onClick={runSearch}><Search size={20} /></button>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="Search in mail"
              className="mail-search-input"
            />
          </div>
        </div>
        
        <div className="mail-header-actions">
          <button className="mail-icon-btn" onClick={() => setTab("settings")}>
            <SettingsIcon size={20} style={{ color: tab === "settings" ? "inherit" : "inherit" }} />
          </button>
          <img src={getAvatarForName(currentUser.name)} className="mail-avatar" alt="me" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
        </div>
      </div>

      {/* Main Layout */}
      <div className="mail-body">
        
        {/* Left Sidebar */}
        <div className="mail-sidebar">
          <button className="mail-compose-btn" onClick={() => setIsComposing(true)}>
            <Edit3 size={18} /> Compose
          </button>
          
          <SidebarItem icon={<Inbox size={18}/>} label="Inbox" active={tab === "inbox"} onClick={() => { setTab("inbox"); setOpenEmailId(null); }} badge={emails.filter(e => e.unread).length.toString()} />
          <SidebarItem icon={<Star size={18}/>} label="Starred" />
          <SidebarItem icon={<Clock size={18}/>} label="Snoozed" />
          <SidebarItem icon={<SendIcon size={18}/>} label="Sent" active={tab === "sent"} onClick={() => { setTab("sent"); setOpenEmailId(null); }} />
          <SidebarItem icon={<File size={18}/>} label="Drafts" active={tab === "drafts"} onClick={() => { setTab("drafts"); setOpenEmailId(null); }} />
        </div>

        {/* Center Content */}
        {tab === "settings" ? (
          <div className="mail-settings">
            <h2 className="mail-settings-title">Settings</h2>
            
            <div className="mail-settings-tabs">
              <TabButton label="General" active={settingsTab === "general"} onClick={() => setSettingsTab("general")} />
              <TabButton label="Forwarding and POP/IMAP" active={settingsTab === "forwarding"} onClick={() => setSettingsTab("forwarding")} />
              <TabButton label="Accounts" active={settingsTab === "accounts"} onClick={() => setSettingsTab("accounts")} />
            </div>
            
            {settingsTab === "forwarding" && (
              <div>
                <div className="mail-setting-row">
                  <div className="mail-setting-label">Forwarding:</div>
                  <div className="mail-setting-content">
                    <button className="mail-btn-outline" style={{ marginBottom: '16px' }}>Add a forwarding address</button>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'rgba(242, 166, 28, 0.1)', borderRadius: '8px', border: '1px solid rgba(242, 166, 28, 0.3)' }}>
                      <AlertCircle style={{ color: '#f2a61c' }} size={20} />
                      <input
                        value={forwardTo}
                        onChange={(e) => setForwardTo(e.target.value)}
                        placeholder="Email address to forward to"
                        style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', borderBottom: '1px solid #ccc' }}
                      />
                      <button
                        className="mail-btn-primary"
                        disabled={!forwardTo.trim()}
                        onClick={() => {
                          record({ event_type: "FORWARDING_RULE_CREATED", action: "FORWARDING_RULE_CREATED", resource_type: "mail_settings", resource_sensitivity: "RESTRICTED", metadata: { forward_to: forwardTo } });
                          setRules((r) => [...r, forwardTo]);
                          setForwardTo("");
                        }}
                      >
                        Create Rule
                      </button>
                    </div>

                    {rules.length > 0 && (
                      <div style={{ marginTop: '24px' }}>
                        <div style={{ fontWeight: 500, marginBottom: '8px' }}>Active Rules</div>
                        {rules.map((r, i) => (
                          <div key={i} style={{ padding: '8px 12px', background: '#f1f3f4', borderRadius: '4px', marginBottom: '4px', fontSize: '13px' }}>
                            Forwarding a copy of incoming mail to <strong>{r}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {settingsTab === "general" && (
              <div>
                <div className="mail-setting-row">
                  <div className="mail-setting-label" style={{ color: '#d93025' }}>Reset Mock Data:</div>
                  <div className="mail-setting-content">
                    <p style={{ color: '#5f6368', fontSize: '14px', marginBottom: '16px' }}>Reset all apps back to their initial static data state.</p>
                    <button className="mail-btn-outline" onClick={async () => {
                      await api.post('/mock/reset');
                      refresh();
                    }}>Reset App Data</button>
                  </div>
                </div>
              </div>
            )}
            
            {settingsTab === "accounts" && (
              <div>
                <div className="mail-setting-row">
                  <div className="mail-setting-label">Security:</div>
                  <div className="mail-setting-content">
                    <p style={{ color: '#5f6368', fontSize: '14px', marginBottom: '16px' }}>Login &amp; device history for this account is monitored by the Security Center.</p>
                    <button className="mail-btn-outline" onClick={() => window.open('/security/overview', '_blank')}>Go to Security Center</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mail-content">
            {!openEmail ? (
              <>
                <div className="mail-toolbar">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button className="mail-icon-btn"><input type="checkbox" style={{ cursor: 'pointer' }} /></button>
                    <button className="mail-icon-btn"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.13 15.57a9 9 0 1 0 3.14-12.02L2 7"/></svg></button>
                    <button className="mail-icon-btn"><MoreVertical size={20} /></button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#5f6368' }}>
                    1-50 of 2,431
                    <div style={{ display: 'flex' }}>
                      <button className="mail-icon-btn"><ChevronLeft size={20} /></button>
                      <button className="mail-icon-btn"><ChevronRight size={20} /></button>
                    </div>
                  </div>
                </div>

                {tab === "inbox" && (
                  <div className="mail-tabs">
                    <CategoryTab icon={<Inbox size={18}/>} label="Primary" active={category === "primary"} onClick={() => setCategory("primary")} />
                    <CategoryTab icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>} label="Promotions" active={category === "promotions"} onClick={() => setCategory("promotions")} />
                    <CategoryTab icon={<User size={18}/>} label="Social" active={category === "social"} onClick={() => setCategory("social")} />
                  </div>
                )}
                
                <div className="mail-list">
                  {emails.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => {
                        setOpenEmailId(e.id);
                        record({ event_type: "EMAIL_OPEN", action: "EMAIL_OPEN", resource_type: "email_thread", resource_id: e.id, data_volume: 15 });
                      }}
                      className={`mail-list-item ${e.unread ? 'unread' : ''}`}
                    >
                      <div className="mail-item-controls">
                        <input type="checkbox" style={{ cursor: 'pointer' }} onClick={e => e.stopPropagation()} />
                        <Star size={20} onClick={e => e.stopPropagation()} />
                      </div>
                      <div className="mail-item-sender">{e.from}</div>
                      <div className="mail-item-content">
                        <span className="mail-item-subject">{e.subject}</span>
                        <span style={{ color: '#5f6368', margin: '0 4px' }}>-</span>
                        <span className="mail-item-snippet">{e.snippet}</span>
                        {e.hasAttachment && <Paperclip size={16} style={{ color: '#5f6368', marginLeft: 'auto' }} />}
                      </div>
                      <div className="mail-item-date">{formatDate(e.timestamp).split(",")[0]}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="mail-reader">
                <div className="mail-toolbar" style={{ borderBottom: 'none', padding: '0 0 16px 0', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button className="mail-icon-btn" onClick={() => setOpenEmailId(null)}><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
                    <button className="mail-icon-btn"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg></button>
                    <button className="mail-icon-btn"><AlertCircle size={20} /></button>
                    <button className="mail-icon-btn"><Trash2 size={20} /></button>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <button className="mail-icon-btn"><ChevronLeft size={20} /></button>
                    <button className="mail-icon-btn"><ChevronRight size={20} /></button>
                  </div>
                </div>

                <div className="mail-reader-subject">
                  {openEmail.subject}
                  <span className="mail-reader-label">Inbox</span>
                </div>
                
                <div className="mail-reader-header">
                  <img src={getAvatarForName(openEmail.from)} className="mail-reader-avatar" alt="sender" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                  <div className="mail-reader-meta">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span className="mail-reader-sender">{openEmail.from}</span>
                        <span className="mail-reader-email">&lt;{openEmail.fromEmail}&gt;</span>
                      </div>
                      <div className="mail-reader-email">{formatDate(openEmail.timestamp)}</div>
                    </div>
                    <div className="mail-reader-to">to me</div>
                  </div>
                </div>
                
                <div className="mail-reader-body">
                  {openEmail.snippet}
                  {"\n\n"}
                  Best regards,
                  {"\n"}
                  {openEmail.from}
                </div>
                
                {openEmail.hasAttachment && (
                  <div className="mail-attachment" onClick={() => {
                    const sensitivity = getSensitivityTier(openEmail.attachmentSizeKb);
                    record({ 
                      event_type: "ATTACHMENT_DOWNLOAD", 
                      action: "ATTACHMENT_DOWNLOAD", 
                      resource_type: "attachment", 
                      resource_id: openEmail.attachmentName ?? undefined, 
                      resource_sensitivity: sensitivity, 
                      data_volume: openEmail.attachmentSizeKb 
                    });
                  }}>
                    <div className="mail-att-icon"><File size={20} /></div>
                    <div className="mail-att-info">
                      <span className="mail-att-name">{openEmail.attachmentName}</span>
                      <span className="mail-att-size">{openEmail.attachmentSizeKb} KB</span>
                    </div>
                  </div>
                )}

                <div className="mail-reply-box">
                  <button className="mail-btn-outline"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-9v6c11 0 10 12 10 12-2-4-7-5-10-5v6l-9-9z"/></svg> Reply</button>
                  <button className="mail-btn-outline"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11l-9-9v6c-11 0-10 12-10 12 2-4 7-5 10-5v6l9-9z"/></svg> Forward</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Compose Modal */}
      {isComposing && (
        <div className="mail-compose-window">
          <div className="mail-compose-header">
            New Message
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="mail-icon-btn" style={{ width: 24, height: 24 }} onClick={() => setIsComposing(false)}><X size={16}/></button>
            </div>
          </div>
          <div className="mail-compose-field">
            <span className="mail-compose-label">To</span>
            <input value={to} onChange={(e) => setTo(e.target.value)} className="mail-compose-input" />
          </div>
          <div className="mail-compose-field">
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="mail-compose-input" style={{ fontWeight: 500 }} />
          </div>
          <textarea 
            value={body} 
            onChange={(e) => setBody(e.target.value)} 
            className="mail-compose-body" 
          />
          <div className="mail-compose-footer">
            <button
              className="mail-btn-primary"
              disabled={!to.trim()}
              onClick={() => {
                const newEmail = {
                  id: `sent-${Date.now()}`,
                  from: currentUser.name,
                  fromEmail: currentUser.email,
                  subject,
                  snippet: body.substring(0, 100),
                  unread: false,
                  hasAttachment: false,
                  timestamp: new Date().toISOString()
                };
                updateData({ ...data, emails: [newEmail, ...emails] });
                record({ event_type: "EMAIL_SEND", action: "EMAIL_SEND", resource_type: "email_thread", resource_id: newEmail.id, data_volume: 10 + body.length });
                setTo(""); setSubject(""); setBody(""); setIsComposing(false);
              }}
            >
              Send
            </button>
            <button className="mail-icon-btn"><Paperclip size={20}/></button>
          </div>
        </div>
      )}

      <ActivityToast feedback={feedback} />
    </div>
  );
}

function SidebarItem({ icon, label, active, badge, onClick }: { icon: React.ReactNode, label: string, active?: boolean, badge?: string, onClick?: () => void }) {
  return (
    <div className={`mail-nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      <div className="mail-nav-left">
        {icon}
        <span>{label}</span>
      </div>
      {badge && <span className="mail-nav-badge">{badge}</span>}
    </div>
  );
}

function CategoryTab({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <div className={`mail-tab ${active ? 'active' : ''}`} onClick={onClick}>
      {icon}
      {label}
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <div className={`mail-settings-tab ${active ? 'active' : ''}`} onClick={onClick}>
      {label}
    </div>
  );
}

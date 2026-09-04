import { useEffect, useMemo, useState } from "react";
import {
  Download, Paperclip, Search, Settings as SettingsIcon,
  Menu, Inbox, Star, Clock, Send as SendIcon, File, AlertCircle,
  MoreVertical, ChevronLeft, ChevronRight, X, User
} from "lucide-react";
import { useCurrentUser } from "../../hooks/CurrentUserContext";
import { useActionRecorder } from "../../hooks/useActionRecorder";
import { generateEmails } from "../../data/mockContent";
import ActivityToast from "../../components/ActivityToast";
import { Button } from "../../components/ui";
import { formatDate } from "../../lib/style";

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
  const emails = useMemo(() => (currentUser ? generateEmails(currentUser, contacts) : []), [currentUser, contacts]);
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

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white dark:bg-black font-sans">
      
      {/* Top Header */}
      <div className="flex items-center justify-between p-2 border-b" style={{ borderColor: "var(--border)", background: "var(--bg-elevated)" }}>
        <div className="flex items-center gap-4 w-64 shrink-0 px-2">
          <Menu className="cursor-pointer hover:opacity-70" />
          <span className="text-xl font-medium tracking-tight" style={{ color: "var(--text)" }}>Northwind Mail</span>
        </div>
        <div className="flex-1 max-w-3xl px-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm transition-shadow focus-within:shadow-md" style={{ borderColor: "var(--border)", background: "var(--bg-inset)" }}>
            <Search size={18} style={{ color: "var(--text-faint)" }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
              placeholder="Search in mail"
              className="flex-1 text-base outline-none bg-transparent"
            />
          </div>
        </div>
        <div className="w-64 flex justify-end px-4 gap-4 items-center shrink-0">
          <SettingsIcon size={20} className="cursor-pointer hover:opacity-70" onClick={() => setTab("settings")} style={{ color: tab === "settings" ? "var(--accent)" : "var(--text-muted)" }}/>
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium shadow-sm">
            {currentUser.name.charAt(0)}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar */}
        <div className="w-64 flex flex-col p-3 gap-1 overflow-y-auto shrink-0 border-r" style={{ borderColor: "var(--border)" }}>
          <button 
            className="flex items-center gap-3 bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 px-5 py-4 rounded-2xl font-medium mb-4 w-fit shadow-sm transition-colors"
            onClick={() => setIsComposing(true)}
          >
            <AlertCircle size={20} />
            Compose
          </button>
          
          <SidebarItem icon={<Inbox size={18}/>} label="Inbox" active={tab === "inbox"} onClick={() => { setTab("inbox"); setOpenEmailId(null); }} badge={emails.filter(e => e.unread).length.toString()} />
          <SidebarItem icon={<Star size={18}/>} label="Starred" />
          <SidebarItem icon={<Clock size={18}/>} label="Snoozed" />
          <SidebarItem icon={<SendIcon size={18}/>} label="Sent" active={tab === "sent"} onClick={() => { setTab("sent"); setOpenEmailId(null); }} />
          <SidebarItem icon={<File size={18}/>} label="Drafts" active={tab === "drafts"} onClick={() => { setTab("drafts"); setOpenEmailId(null); }} />
        </div>

        {/* Center Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {tab === "settings" ? (
            <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
              <h2 className="text-2xl font-normal mb-6">Settings</h2>
              
              <div className="flex border-b mb-6" style={{ borderColor: "var(--border)" }}>
                <TabButton label="General" active={settingsTab === "general"} onClick={() => setSettingsTab("general")} />
                <TabButton label="Forwarding and POP/IMAP" active={settingsTab === "forwarding"} onClick={() => setSettingsTab("forwarding")} />
                <TabButton label="Accounts" active={settingsTab === "accounts"} onClick={() => setSettingsTab("accounts")} />
              </div>
              
              {settingsTab === "forwarding" && (
                <div className="flex flex-col gap-6">
                  <div className="rounded-xl border p-6 shadow-sm" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
                    <div className="text-lg font-medium mb-4">Forwarding</div>
                    <div className="flex items-center gap-4 mb-4">
                      <Button variant="secondary">Add a forwarding address</Button>
                      <span className="text-sm" style={{ color: "var(--text-muted)" }}>You can forward your messages to another address.</span>
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/10" style={{ borderColor: "var(--border)" }}>
                      <AlertCircle className="text-yellow-600" size={20} />
                      <div className="flex-1">
                        <input
                          value={forwardTo}
                          onChange={(e) => setForwardTo(e.target.value)}
                          placeholder="Email address to forward to"
                          className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 outline-none text-sm py-1"
                        />
                      </div>
                      <Button
                        disabled={!forwardTo.trim()}
                        onClick={() => {
                          record({ event_type: "FORWARDING_RULE_CREATED", action: "FORWARDING_RULE_CREATED", resource_type: "mail_settings", resource_sensitivity: "RESTRICTED", metadata: { forward_to: forwardTo } });
                          setRules((r) => [...r, forwardTo]);
                          setForwardTo("");
                        }}
                      >
                        Create Rule
                      </Button>
                    </div>

                    {rules.length > 0 && (
                      <div className="mt-6 flex flex-col gap-2">
                        <div className="text-sm font-medium">Active Rules</div>
                        {rules.map((r, i) => (
                          <div key={i} className="text-sm py-2 px-3 rounded bg-gray-50 dark:bg-gray-800 border" style={{ borderColor: "var(--border)" }}>
                            Forwarding a copy of incoming mail to <span className="font-semibold">{r}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {settingsTab === "general" && (
                <div className="text-sm" style={{ color: "var(--text-muted)" }}>General settings would appear here.</div>
              )}
              
              {settingsTab === "accounts" && (
                <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                  <p className="mb-2">Login &amp; device history for this account is monitored by the Security Center.</p>
                  <Button variant="secondary" onClick={() => window.open('/security/overview', '_blank')}>Go to Security Center</Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full">
              {/* Thread List Pane */}
              <div className={`flex flex-col border-r flex-1 ${openEmail ? 'hidden md:flex md:w-1/2 lg:w-5/12 max-w-md' : ''}`} style={{ borderColor: "var(--border)" }}>
                {tab === "inbox" && (
                  <div className="flex border-b shrink-0 px-2" style={{ borderColor: "var(--border)" }}>
                    <CategoryTab icon={<Inbox size={18}/>} label="Primary" active={category === "primary"} onClick={() => setCategory("primary")} />
                    <CategoryTab icon={<Tag size={18}/>} label="Promotions" active={category === "promotions"} onClick={() => setCategory("promotions")} />
                    <CategoryTab icon={<User size={18}/>} label="Social" active={category === "social"} onClick={() => setCategory("social")} />
                  </div>
                )}
                
                <div className="flex items-center justify-between px-4 py-2 border-b text-xs" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                  <div className="flex gap-3">
                    <input type="checkbox" className="rounded" />
                  </div>
                  <div>1-50 of 2,431</div>
                </div>
                
                <div className="overflow-y-auto flex-1 divide-y" style={{ borderColor: "var(--border)" }}>
                  {emails.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => {
                        setOpenEmailId(e.id);
                        record({ event_type: "EMAIL_OPEN", action: "EMAIL_OPEN", resource_type: "email_thread", resource_id: e.id, data_volume: 15 });
                      }}
                      className={`flex items-center gap-3 px-4 py-2 cursor-pointer group ${openEmailId === e.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                      style={{ background: e.unread && openEmailId !== e.id ? "var(--bg-elevated)" : undefined }}
                    >
                      <input type="checkbox" className="rounded opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()} />
                      <Star size={16} className={`shrink-0 ${e.unread ? 'text-gray-400' : 'text-gray-300'} hover:text-yellow-400`} onClick={e => e.stopPropagation()} />
                      <div className="flex-1 min-w-0 flex flex-col py-1">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className={`truncate text-sm ${e.unread ? 'font-bold' : 'font-medium'}`} style={{ color: "var(--text)" }}>{e.from}</span>
                          <span className={`text-xs shrink-0 ml-2 ${e.unread ? 'font-bold' : ''}`} style={{ color: e.unread ? "var(--accent)" : "var(--text-faint)" }}>
                            {formatDate(e.timestamp).split(",")[0]}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`truncate text-sm ${e.unread ? 'font-bold' : 'font-normal'}`} style={{ color: "var(--text)" }}>
                            {e.subject}
                          </span>
                          {e.hasAttachment && <Paperclip size={12} className="shrink-0 text-gray-500" />}
                        </div>
                        <span className="truncate text-sm" style={{ color: "var(--text-muted)" }}>
                          {e.snippet}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reading Pane */}
              <div className={`flex-1 flex flex-col bg-white dark:bg-black ${!openEmail ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
                {!openEmail ? (
                  <div className="text-center p-8 flex flex-col items-center gap-4 opacity-50">
                    <Inbox size={64} className="text-gray-300" />
                    <p className="text-lg">Select an item to read</p>
                    <p className="text-sm">Nothing is selected</p>
                  </div>
                ) : (
                  <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
                      <div className="flex items-center gap-4 text-gray-500">
                        <button className="md:hidden hover:bg-gray-100 p-1 rounded" onClick={() => setOpenEmailId(null)}><ChevronLeft size={20}/></button>
                        <AlertCircle size={18} className="cursor-pointer hover:text-gray-800"/>
                        <File size={18} className="cursor-pointer hover:text-gray-800"/>
                      </div>
                      <div className="flex items-center gap-4 text-gray-500 text-sm">
                        <ChevronLeft size={20} className="cursor-pointer hover:text-gray-800"/>
                        <ChevronRight size={20} className="cursor-pointer hover:text-gray-800"/>
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 md:p-8">
                      <div className="flex items-start justify-between mb-8">
                        <h2 className="text-2xl font-normal" style={{ color: "var(--text)" }}>{openEmail.subject}</h2>
                        <div className="flex gap-2 text-xs border rounded-md px-2 py-1" style={{ borderColor: "var(--border)", background: "var(--bg-inset)" }}>
                          Inbox <X size={12} className="cursor-pointer"/>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 flex items-center justify-center font-bold text-lg shrink-0">
                          {openEmail.from.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-sm">
                                {openEmail.from} <span className="font-normal text-xs ml-1" style={{ color: "var(--text-muted)" }}>&lt;{openEmail.fromEmail}&gt;</span>
                              </div>
                              <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>to me</div>
                            </div>
                            <div className="text-xs text-right" style={{ color: "var(--text-muted)" }}>
                              {formatDate(openEmail.timestamp)}
                              <div className="flex justify-end gap-2 mt-1">
                                <Star size={16} className="cursor-pointer hover:text-yellow-400" />
                                <SendIcon size={16} className="cursor-pointer hover:text-gray-700" />
                                <MoreVertical size={16} className="cursor-pointer hover:text-gray-700" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm whitespace-pre-wrap leading-relaxed mb-8" style={{ color: "var(--text)" }}>
                        {openEmail.snippet}
                        {"\n\n"}
                        Best regards,
                        {"\n"}
                        {openEmail.from}
                      </div>
                      
                      {openEmail.hasAttachment && (
                        <div className="mt-8 border-t pt-6" style={{ borderColor: "var(--border)" }}>
                          <div className="text-sm font-medium mb-3 flex items-center gap-2">
                            1 Attachment <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>• Scanned by Security Center</span>
                          </div>
                          <div 
                            className="inline-flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                            style={{ borderColor: "var(--border)" }}
                            onClick={() => {
                              const sensitivity = getSensitivityTier(openEmail.attachmentSizeKb);
                              record({ 
                                event_type: "ATTACHMENT_DOWNLOAD", 
                                action: "ATTACHMENT_DOWNLOAD", 
                                resource_type: "attachment", 
                                resource_id: openEmail.attachmentName ?? undefined, 
                                resource_sensitivity: sensitivity, 
                                data_volume: openEmail.attachmentSizeKb 
                              });
                            }}
                          >
                            <div className="w-10 h-10 rounded bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                              <File size={24} />
                            </div>
                            <div className="flex flex-col pr-8">
                              <span className="text-sm font-medium">{openEmail.attachmentName}</span>
                              <span className="text-xs" style={{ color: "var(--text-muted)" }}>{openEmail.attachmentSizeKb} KB</span>
                            </div>
                            <div className="ml-auto w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Download size={16} />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-8 flex gap-3">
                        <Button variant="secondary"><span className="flex gap-2 items-center"><SendIcon size={14}/> Reply</span></Button>
                        <Button variant="secondary"><span className="flex gap-2 items-center"><SendIcon size={14} className="scale-x-[-1]"/> Forward</span></Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Compose Modal */}
      {isComposing && (
        <div className="fixed bottom-0 right-16 w-full max-w-lg shadow-2xl rounded-t-xl flex flex-col border border-b-0 overflow-hidden z-50 bg-white dark:bg-black" style={{ borderColor: "var(--border)", height: "500px" }}>
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-100 dark:bg-gray-800">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">New Message</span>
            <div className="flex gap-2 text-gray-500">
              <button className="hover:bg-gray-200 dark:hover:bg-gray-700 p-1 rounded" onClick={() => setIsComposing(false)}><X size={16}/></button>
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <div className="border-b flex items-center px-4 py-1" style={{ borderColor: "var(--border)" }}>
              <span className="text-sm text-gray-500 w-10">To</span>
              <input value={to} onChange={(e) => setTo(e.target.value)} className="flex-1 outline-none text-sm py-1 bg-transparent" />
            </div>
            <div className="border-b flex items-center px-4 py-1" style={{ borderColor: "var(--border)" }}>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="flex-1 outline-none text-sm font-medium py-1 bg-transparent" />
            </div>
            <textarea 
              value={body} 
              onChange={(e) => setBody(e.target.value)} 
              className="flex-1 resize-none p-4 outline-none text-sm bg-transparent" 
            />
            <div className="p-3 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
              <div className="flex gap-2">
                <Button
                  disabled={!to.trim()}
                  onClick={() => {
                    record({ event_type: "EMAIL_SEND", action: "EMAIL_SEND", resource_type: "email_thread", resource_id: `sent-${Date.now()}`, data_volume: 10 + body.length });
                    setTo(""); setSubject(""); setBody(""); setIsComposing(false);
                  }}
                  className="rounded-full px-6"
                >
                  Send
                </Button>
                <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"><Paperclip size={18}/></button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ActivityToast feedback={feedback} />
    </div>
  );
}

function SidebarItem({ icon, label, active, badge, onClick }: { icon: React.ReactNode, label: string, active?: boolean, badge?: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-between px-5 py-2 rounded-r-full mr-4 transition-colors ${active ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 font-bold' : 'hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300'}`}
    >
      <div className="flex items-center gap-4">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      {badge && <span className="text-xs font-bold">{badge}</span>}
    </button>
  );
}

function CategoryTab({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-6 py-3 border-b-2 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30 ${active ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500'}`}
    >
      {icon}
      {label}
    </button>
  );
}

function TabButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${active ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
    >
      {label}
    </button>
  );
}

// Icon polyfill for Tag (lucide-react has it but just in case, reusing standard ones)
function Tag(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={props.size||24} height={props.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
}

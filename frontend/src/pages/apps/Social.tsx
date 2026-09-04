import { useEffect, useMemo, useState } from "react";
import {
  Heart, MessageCircle, Send, Settings as SettingsIcon,
  User as UserIcon, Home, Search, PlaySquare, MoreHorizontal,
  Bookmark, Share2, Grid, Bookmark as BookmarkIcon, Tag, Camera
} from "lucide-react";
import { useCurrentUser } from "../../hooks/CurrentUserContext";
import { useActionRecorder } from "../../hooks/useActionRecorder";
import { generatePosts } from "../../data/mockContent";
import ActivityToast from "../../components/ActivityToast";
import { Button } from "../../components/ui";

type Tab = "feed" | "explore" | "reels" | "messages" | "profile" | "settings";

export default function Social() {
  const { currentUser, users } = useCurrentUser();
  const { record, feedback } = useActionRecorder("social");
  const [tab, setTab] = useState<Tab>("feed");
  const [caption, setCaption] = useState("");
  const [activeThread, setActiveThread] = useState<number | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [privacy, setPrivacy] = useState("Public");
  const [notifications, setNotifications] = useState(true);

  const contacts = useMemo(() => users.filter((u) => u.id !== currentUser?.id), [users, currentUser]);
  const posts = useMemo(() => (currentUser ? generatePosts(currentUser, contacts) : []), [currentUser, contacts]);

  useEffect(() => {
    if (currentUser) record({ event_type: "LOGIN", action: "LOGIN" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  if (!currentUser) return null;

  return (
    <div className="flex h-[calc(100vh-64px)] max-w-6xl mx-auto border-x" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
      {/* Sidebar Navigation */}
      <div className="w-16 md:w-64 border-r flex flex-col justify-between py-6 px-3 shrink-0" style={{ borderColor: "var(--border)" }}>
        <div className="flex flex-col gap-2">
          <div className="hidden md:block px-4 pb-6 font-bold text-2xl italic tracking-tighter" style={{ color: "var(--text)" }}>Pulse</div>
          
          <NavItem icon={<Home />} label="Home" active={tab === "feed"} onClick={() => setTab("feed")} />
          <NavItem icon={<Search />} label="Explore" active={tab === "explore"} onClick={() => setTab("explore")} />
          <NavItem icon={<PlaySquare />} label="Reels" active={tab === "reels"} onClick={() => setTab("reels")} />
          <NavItem icon={<Send />} label="Messages" active={tab === "messages"} onClick={() => setTab("messages")} />
          <NavItem icon={<UserIcon />} label="Profile" active={tab === "profile"} onClick={() => setTab("profile")} />
        </div>
        
        <div className="flex flex-col gap-2">
          <NavItem icon={<SettingsIcon />} label="Settings" active={tab === "settings"} onClick={() => setTab("settings")} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative bg-black/5 dark:bg-transparent">
        {tab === "feed" && (
          <div className="max-w-xl mx-auto py-8 px-4 flex flex-col gap-6">
            {/* Stories */}
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              <div className="flex flex-col items-center gap-1 shrink-0 cursor-pointer">
                <div className="w-16 h-16 rounded-full border-2 p-0.5 flex items-center justify-center relative" style={{ borderColor: "var(--border)" }}>
                  <div className="w-full h-full rounded-full bg-gray-200" style={{ background: "var(--bg-inset)" }}></div>
                  <div className="absolute bottom-0 right-0 rounded-full bg-blue-500 text-white p-0.5 border-2 border-white"><Camera size={12}/></div>
                </div>
                <span className="text-xs truncate w-16 text-center">Your story</span>
              </div>
              {contacts.slice(0, 8).map(c => (
                <div key={c.id} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => record({ event_type: "PROFILE_VIEW", action: "PROFILE_VIEW", resource_type: "profile", resource_id: c.name })}>
                  <div className="w-16 h-16 rounded-full p-0.5" style={{ background: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)" }}>
                    <div className="w-full h-full rounded-full border-2" style={{ borderColor: "var(--bg)", background: "var(--bg-inset)" }} />
                  </div>
                  <span className="text-xs truncate w-16 text-center">{c.name.split(" ")[0]}</span>
                </div>
              ))}
            </div>

            {/* Create Post */}
            <div className="flex flex-col gap-3 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full shrink-0" style={{ background: "var(--bg-inset)" }}></div>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={`What's happening, ${currentUser.name.split(" ")[0]}?`}
                  rows={1}
                  className="w-full resize-none outline-none bg-transparent text-sm"
                />
              </div>
              <div className="flex justify-end">
                <Button disabled={!caption.trim()} onClick={() => {
                  record({ event_type: "POST_CREATE", action: "POST_CREATE", resource_type: "post", resource_id: `post-${Date.now()}`, data_volume: 20 + caption.length });
                  setCaption("");
                }}>Post</Button>
              </div>
            </div>

            {/* Feed */}
            <div className="flex flex-col gap-8">
              {posts.map((p) => (
                <div key={p.id} className="flex flex-col gap-3 pb-8 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center justify-between px-1">
                    <button className="flex items-center gap-2 font-semibold text-sm hover:opacity-80" onClick={() => record({ event_type: "PROFILE_VIEW", action: "PROFILE_VIEW", resource_type: "profile", resource_id: p.author })}>
                      <div className="w-8 h-8 rounded-full" style={{ background: "var(--bg-inset)" }}></div>
                      {p.author}
                    </button>
                    <MoreHorizontal size={20} className="cursor-pointer" style={{ color: "var(--text-muted)" }}/>
                  </div>
                  <div 
                    className="w-full aspect-square rounded-sm cursor-pointer relative group flex items-center justify-center transition-all" 
                    style={{ background: `linear-gradient(135deg, hsl(${p.hue},70%,60%), hsl(${(p.hue + 60) % 360},70%,50%))` }}
                    onDoubleClick={() => record({ event_type: "SETTINGS_CHANGE", action: "LIKE_POST", resource_type: "post", metadata: { post_id: p.id } })}
                  >
                  </div>
                  <div className="flex flex-col gap-2 px-1">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4">
                        <Heart size={24} className="cursor-pointer hover:opacity-70 transition-opacity" />
                        <MessageCircle size={24} className="cursor-pointer hover:opacity-70 transition-opacity" />
                        <Share2 size={24} className="cursor-pointer hover:opacity-70 transition-opacity" />
                      </div>
                      <Bookmark 
                        size={24} 
                        className="cursor-pointer hover:opacity-70 transition-opacity" 
                        onClick={() => record({ event_type: "CONTENT_DOWNLOAD", action: "CONTENT_DOWNLOAD", resource_type: "media", resource_id: p.id, data_volume: 180 })}
                      />
                    </div>
                    <div className="font-semibold text-sm">{p.likes} likes</div>
                    <div className="text-sm">
                      <span className="font-semibold mr-2">{p.author}</span>
                      {p.caption}
                    </div>
                    <div className="text-sm cursor-pointer mt-1" style={{ color: "var(--text-muted)" }}>View all {p.comments} comments</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "explore" && (
          <div className="max-w-4xl mx-auto p-4">
            <div className="grid grid-cols-3 gap-1 md:gap-4">
              {Array.from({ length: 15 }).map((_, i) => (
                <div 
                  key={i} 
                  className="aspect-square cursor-pointer hover:opacity-90 transition-opacity rounded-sm"
                  style={{ background: `hsl(${(i * 45) % 360}, 60%, 50%)` }}
                  onClick={() => record({ event_type: "CONTENT_DOWNLOAD", action: "CONTENT_DOWNLOAD", resource_type: "media", resource_id: `explore-${i}`, data_volume: 200 })}
                ></div>
              ))}
            </div>
          </div>
        )}

        {tab === "reels" && (
          <div className="h-full w-full flex items-center justify-center p-4 bg-black">
            <div className="h-full max-h-[800px] w-full max-w-[450px] rounded-xl flex flex-col relative overflow-hidden shadow-2xl" style={{ background: "linear-gradient(45deg, #111, #222)" }}>
              <div className="absolute top-4 left-4 font-bold text-white text-xl drop-shadow-md">Reels</div>
              <div className="mt-auto p-4 text-white drop-shadow-md z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gray-500"></div>
                  <span className="font-semibold">alex_codes</span>
                  <button className="border border-white/50 rounded-md px-2 py-0.5 text-xs font-semibold hover:bg-white/20 transition-colors" onClick={() => record({ event_type: "FOLLOW_USER", action: "FOLLOW_USER", resource_type: "profile", resource_id: "alex_codes" })}>Follow</button>
                </div>
                <p className="text-sm font-medium">Building the future of web apps 🚀 #coding #dev</p>
              </div>
              <div className="absolute right-4 bottom-20 flex flex-col gap-6 text-white items-center z-10">
                <div className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity"><Heart size={28} /><span className="text-xs font-semibold">12k</span></div>
                <div className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity"><MessageCircle size={28} /><span className="text-xs font-semibold">342</span></div>
                <div className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity"><Send size={28} /></div>
                <div className="flex flex-col items-center gap-1 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => record({ event_type: "CONTENT_DOWNLOAD", action: "CONTENT_DOWNLOAD", resource_type: "media", resource_id: "reel-1", data_volume: 4500 })}><MoreHorizontal size={28} /></div>
              </div>
            </div>
          </div>
        )}

        {tab === "messages" && (
          <div className="flex h-full bg-white dark:bg-transparent">
            <div className="w-24 md:w-80 border-r overflow-y-auto shrink-0 flex flex-col" style={{ borderColor: "var(--border)" }}>
              <div className="p-5 font-bold text-xl border-b truncate hidden md:block" style={{ borderColor: "var(--border)" }}>{currentUser.name}</div>
              {contacts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveThread(c.id);
                    record({ event_type: "MESSAGE_READ", action: "MESSAGE_READ", resource_type: "message", resource_id: `thread-${c.id}` });
                  }}
                  className="w-full text-left p-4 hover:opacity-75 flex items-center gap-3 transition-colors"
                  style={{ background: activeThread === c.id ? "var(--bg-inset)" : "transparent" }}
                >
                  <div className="w-12 h-12 rounded-full shrink-0" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}></div>
                  <div className="flex-1 min-w-0 hidden md:block">
                    <div className="font-medium truncate text-sm">{c.name}</div>
                    <div className="text-xs truncate mt-1" style={{ color: "var(--text-muted)" }}>Tap to chat</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex-1 flex flex-col relative">
              {activeThread == null ? (
                <div className="m-auto flex flex-col items-center gap-3" style={{ color: "var(--text-faint)" }}>
                  <Send size={48} />
                  <div className="text-xl font-semibold text-center">Your Messages</div>
                  <div className="text-sm text-center max-w-xs">Send private photos and messages to a friend or group.</div>
                </div>
              ) : (
                <>
                  <div className="p-4 border-b font-semibold flex items-center gap-3 shadow-sm z-10 bg-white/50 backdrop-blur-md" style={{ borderColor: "var(--border)" }}>
                    <div className="w-8 h-8 rounded-full" style={{ background: "var(--bg-inset)" }}></div>
                    {contacts.find((c) => c.id === activeThread)?.name}
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-2">
                    <div className="m-auto flex flex-col items-center gap-2 mb-8 mt-auto pt-10" style={{ color: "var(--text-faint)" }}>
                       <div className="w-20 h-20 rounded-full shadow-sm" style={{ background: "var(--bg-inset)" }}></div>
                       <div className="font-semibold text-lg" style={{ color: "var(--text)" }}>{contacts.find((c) => c.id === activeThread)?.name}</div>
                       <Button variant="secondary" onClick={() => record({ event_type: "PROFILE_VIEW", action: "PROFILE_VIEW", resource_type: "profile", resource_id: contacts.find((c) => c.id === activeThread)?.name })}>View Profile</Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 border rounded-full px-4 py-2 bg-white dark:bg-black" style={{ borderColor: "var(--border)" }}>
                      <input
                        value={messageDraft}
                        onChange={(e) => setMessageDraft(e.target.value)}
                        placeholder="Message..."
                        className="flex-1 text-sm bg-transparent outline-none py-1"
                      />
                      {messageDraft.trim() && (
                        <button
                          className="text-sm font-semibold text-blue-500 hover:text-blue-400 transition-colors px-2"
                          onClick={() => {
                            record({ event_type: "MESSAGE_SEND", action: "MESSAGE_SEND", resource_type: "message", resource_id: `thread-${activeThread}`, data_volume: 5 + messageDraft.length });
                            setMessageDraft("");
                          }}
                        >
                          Send
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {tab === "profile" && (
          <div className="max-w-4xl mx-auto pt-8 pb-12">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start px-4 mb-10">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full flex shrink-0 items-center justify-center text-4xl font-semibold border-4" style={{ background: "var(--accent-soft)", color: "var(--accent)", borderColor: "var(--bg-inset)" }}>
                <UserIcon size={64} />
              </div>
              <div className="flex flex-col gap-4 text-center md:text-left flex-1">
                <div className="flex flex-col md:flex-row items-center gap-4 justify-center md:justify-start">
                  <div className="text-xl font-medium">{currentUser.name}</div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setTab("settings")}>Edit profile</Button>
                    <Button variant="secondary" onClick={() => record({ event_type: "SETTINGS_CHANGE", action: "SETTINGS_CHANGE", resource_type: "profile" })}>View archive</Button>
                  </div>
                </div>
                <div className="flex justify-center md:justify-start gap-8 text-base">
                  <div><span className="font-semibold">{posts.length}</span> posts</div>
                  <div><span className="font-semibold">342</span> followers</div>
                  <div><span className="font-semibold">{contacts.length}</span> following</div>
                </div>
                <div className="text-sm mt-2">
                  <div className="font-semibold">{currentUser.name}</div>
                  <div style={{ color: "var(--text-muted)" }}>{currentUser.role} · {currentUser.department}</div>
                </div>
              </div>
            </div>

            <div className="border-t flex justify-center gap-12 uppercase text-xs font-semibold tracking-widest" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
              <div className="flex items-center gap-2 py-4 border-t-2 text-current cursor-pointer" style={{ borderColor: "var(--text)" }}><Grid size={14}/> Posts</div>
              <div className="flex items-center gap-2 py-4 border-t-2 border-transparent cursor-pointer hover:text-current"><BookmarkIcon size={14}/> Saved</div>
              <div className="flex items-center gap-2 py-4 border-t-2 border-transparent cursor-pointer hover:text-current"><Tag size={14}/> Tagged</div>
            </div>

            <div className="grid grid-cols-3 gap-1 md:gap-2 p-1">
              {posts.map((p) => (
                <div 
                  key={p.id} 
                  className="aspect-square cursor-pointer hover:opacity-90 transition-opacity rounded-sm shadow-sm"
                  style={{ background: `linear-gradient(135deg, hsl(${p.hue},70%,60%), hsl(${(p.hue + 60) % 360},70%,50%))` }}
                  onClick={() => record({ event_type: "CONTENT_DOWNLOAD", action: "CONTENT_DOWNLOAD", resource_type: "media", resource_id: p.id, data_volume: 180 })}
                ></div>
              ))}
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="max-w-3xl mx-auto p-4 md:p-8">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            <div className="flex flex-col gap-6">
              
              <div className="rounded-xl border p-6 flex flex-col gap-4 shadow-sm" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
                <div className="text-lg font-semibold border-b pb-2 flex items-center gap-2" style={{ borderColor: "var(--border)" }}><SettingsIcon size={18}/> Account Privacy</div>
                <label className="flex items-center justify-between text-sm cursor-pointer mt-2">
                  <span className="font-medium">Private account</span>
                  <select
                    value={privacy}
                    onChange={(e) => {
                      setPrivacy(e.target.value);
                      record({ event_type: "SETTINGS_CHANGE", action: "SETTINGS_CHANGE", resource_type: "account_settings", metadata: { field: "visibility", value: e.target.value } });
                    }}
                    className="rounded-lg border px-3 py-1.5 text-sm cursor-pointer outline-none"
                    style={{ background: "var(--bg-inset)", borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    <option>Public</option>
                    <option>Private</option>
                  </select>
                </label>
                <div className="text-xs" style={{ color: "var(--text-faint)" }}>When your account is public, your profile and posts can be seen by anyone, on or off Pulse.</div>
              </div>

              <div className="rounded-xl border p-6 flex flex-col gap-4 shadow-sm" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
                <div className="text-lg font-semibold border-b pb-2 flex items-center gap-2" style={{ borderColor: "var(--border)" }}><Heart size={18}/> Notifications</div>
                <label className="flex items-center justify-between text-sm cursor-pointer mt-2">
                  <span className="font-medium">Push notifications</span>
                  <input
                    type="checkbox"
                    className="w-5 h-5 cursor-pointer accent-blue-500"
                    checked={notifications}
                    onChange={(e) => {
                      setNotifications(e.target.checked);
                      record({ event_type: "SETTINGS_CHANGE", action: "SETTINGS_CHANGE", resource_type: "account_settings", metadata: { field: "notifications", value: e.target.checked } });
                    }}
                  />
                </label>
              </div>

              <div className="rounded-xl border p-6 flex flex-col gap-4 shadow-sm" style={{ background: "var(--bg-elevated)", borderColor: "var(--border)" }}>
                <div className="text-lg font-semibold border-b pb-2" style={{ borderColor: "var(--border)" }}>Login Activity</div>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  See your recent login history and manage trusted devices in the main Security Center dashboard.
                </p>
                <div>
                  <Button variant="secondary" onClick={() => window.open('/security/overview', '_blank')}>Go to Security Center</Button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      <ActivityToast feedback={feedback} />
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-4 p-3 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/5 w-full ${active ? 'font-bold' : ''}`}
      style={{ background: active ? "var(--bg-inset)" : "transparent" }}
    >
      <div className={`shrink-0 ${active ? 'scale-110' : ''} transition-transform`}>{icon}</div>
      <span className="hidden md:block text-base">{label}</span>
    </button>
  );
}

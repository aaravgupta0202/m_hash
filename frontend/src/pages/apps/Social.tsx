import { useEffect, useMemo, useState } from "react";
import {
  Heart, MessageCircle, Send, Settings as SettingsIcon,
  User as UserIcon, Home, Search, PlaySquare, MoreHorizontal,
  Bookmark, Share2, Grid, Bookmark as BookmarkIcon, Tag, Camera
} from "lucide-react";
import { useCurrentUser } from "../../hooks/CurrentUserContext";
import { useActionRecorder } from "../../hooks/useActionRecorder";
import { useMockData } from "../../hooks/useMockData";
import { api } from "../../services/api";
import ActivityToast from "../../components/ActivityToast";

import "./social.css";

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
  const { data, updateData, loading, refresh } = useMockData<{posts: any[], threads: Record<string, any[]>}>("social", { posts: [], threads: {} });
  const posts = data.posts;
  const threads = data.threads;

  useEffect(() => {
    if (currentUser) record({ event_type: "LOGIN", action: "LOGIN" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  if (!currentUser) return null;

  return (
    <div className="pulse-app">
      {/* Sidebar Navigation */}
      <div className="pulse-sidebar">
        <div className="pulse-logo">Pulse</div>
        
        <div style={{ display: "flex", flexDirection: "column", width: "100%", padding: "0 12px", gap: "8px" }}>
          <NavItem icon={<Home />} label="Home" active={tab === "feed"} onClick={() => setTab("feed")} />
          <NavItem icon={<Search />} label="Explore" active={tab === "explore"} onClick={() => setTab("explore")} />
          <NavItem icon={<PlaySquare />} label="Reels" active={tab === "reels"} onClick={() => setTab("reels")} />
          <NavItem icon={<Send />} label="Messages" active={tab === "messages"} onClick={() => setTab("messages")} />
          <NavItem icon={<UserIcon />} label="Profile" active={tab === "profile"} onClick={() => setTab("profile")} />
        </div>
        
        <div style={{ marginTop: "auto", width: "100%", padding: "0 12px" }}>
          <NavItem icon={<SettingsIcon />} label="Settings" active={tab === "settings"} onClick={() => setTab("settings")} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pulse-main">
        {tab === "feed" && (
          <div className="pulse-feed-container">
            {/* Stories */}
            <div className="pulse-stories">
              <div className="pulse-story">
                <div className="pulse-story-ring add-story">
                  <div className="pulse-story-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                     <Camera size={20} color="#fff" />
                     <div style={{ position: 'absolute', bottom: 2, right: 2, background: '#ff007f', borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 'bold' }}>+</div>
                  </div>
                </div>
                <span className="pulse-story-name">Your story</span>
              </div>
              {contacts.slice(0, 8).map(c => (
                <div key={c.id} className="pulse-story" onClick={() => record({ event_type: "PROFILE_VIEW", action: "PROFILE_VIEW", resource_type: "profile", resource_id: c.name })}>
                  <div className="pulse-story-ring">
                    <img src={`/images/avatar_${(Number(c.id) % 7) + 1}.jpg`} className="pulse-story-img" alt={c.name} />
                  </div>
                  <span className="pulse-story-name">{c.name.split(" ")[0]}</span>
                </div>
              ))}
            </div>

            {/* Create Post */}
            <div className="pulse-create-post">
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img src={`/images/avatar_${(Number(currentUser.id) % 7) + 1}.jpg`} alt="me" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder={`What's happening, ${currentUser.name.split(" ")[0]}?`}
                  rows={2}
                  className="pulse-create-input"
                />
              </div>
              <button 
                className="pulse-btn" 
                disabled={!caption.trim()} 
                onClick={() => {
                  const newPost = {
                    id: `post-${Date.now()}`,
                    author: currentUser.name,
                    authorAvatar: `/images/avatar_${(Number(currentUser.id) % 7) + 1}.jpg`,
                    caption,
                    likes: 0,
                    comments: 0,
                    imageUrl: `/images/post_${["office", "team", "travel"][Math.floor(Math.random() * 3)]}.jpg`
                  };
                  updateData({ ...data, posts: [newPost, ...posts] });
                  record({ event_type: "POST_CREATE", action: "POST_CREATE", resource_type: "post", resource_id: newPost.id, data_volume: 20 + caption.length });
                  setCaption("");
                }}
              >
                Post
              </button>
            </div>

            {/* Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {posts.map((p) => (
                <div key={p.id} className="pulse-post">
                  <div className="pulse-post-header">
                    <div className="pulse-post-author" onClick={() => record({ event_type: "PROFILE_VIEW", action: "PROFILE_VIEW", resource_type: "profile", resource_id: p.author })}>
                      <img src={(p as any).authorAvatar} className="pulse-post-avatar" alt={p.author} />
                      {p.author}
                    </div>
                    <button className="pulse-icon-btn"><MoreHorizontal size={20} /></button>
                  </div>
                  <div 
                    className="pulse-post-image-container" 
                    onDoubleClick={() => record({ event_type: "SETTINGS_CHANGE", action: "LIKE_POST", resource_type: "post", metadata: { post_id: p.id } })}
                  >
                     <img src={(p as any).imageUrl} alt="post" className="pulse-post-image" />
                  </div>
                  <div className="pulse-post-actions">
                    <div className="pulse-action-group">
                      <button className="pulse-icon-btn"><Heart size={26} /></button>
                      <button className="pulse-icon-btn"><MessageCircle size={26} /></button>
                      <button className="pulse-icon-btn"><Share2 size={26} /></button>
                    </div>
                    <button className="pulse-icon-btn" onClick={() => record({ event_type: "CONTENT_DOWNLOAD", action: "CONTENT_DOWNLOAD", resource_type: "media", resource_id: p.id, data_volume: 180 })}>
                      <Bookmark size={26} />
                    </button>
                  </div>
                  <div className="pulse-post-info">
                    <div className="pulse-likes">{p.likes} likes</div>
                    <div className="pulse-caption">
                      <span className="pulse-caption-author">{p.author}</span>
                      {p.caption}
                    </div>
                    <div className="pulse-comments-link">View all {p.comments} comments</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "explore" && (
          <div className="pulse-explore-grid">
            {Array.from({ length: 15 }).map((_, i) => (
              <div 
                key={i} 
                className="pulse-explore-item"
                style={{ backgroundImage: `url(/images/post_${["office", "team", "travel"][i % 3]}.jpg)` }}
                onClick={() => record({ event_type: "CONTENT_DOWNLOAD", action: "CONTENT_DOWNLOAD", resource_type: "media", resource_id: `explore-${i}`, data_volume: 200 })}
              ></div>
            ))}
          </div>
        )}

        {tab === "reels" && (
          <div className="pulse-reels-container">
            <div className="pulse-reel" style={{ backgroundImage: 'url(/images/reel_coding.jpg)' }}>
              <div className="pulse-reel-overlay">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#666' }}></div>
                  <span style={{ fontWeight: 'bold' }}>alex_codes</span>
                  <button style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => record({ event_type: "FOLLOW_USER", action: "FOLLOW_USER", resource_type: "profile", resource_id: "alex_codes" })}>Follow</button>
                </div>
                <p style={{ fontSize: '14px', fontWeight: 500 }}>Building the future of web apps 🚀 #coding #dev</p>
              </div>
              <div className="pulse-reel-actions">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><Heart size={28} /><span style={{ fontSize: '12px', fontWeight: 'bold' }}>12k</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><MessageCircle size={28} /><span style={{ fontSize: '12px', fontWeight: 'bold' }}>342</span></div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}><Send size={28} /></div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => record({ event_type: "CONTENT_DOWNLOAD", action: "CONTENT_DOWNLOAD", resource_type: "media", resource_id: "reel-1", data_volume: 4500 })}><MoreHorizontal size={28} /></div>
              </div>
            </div>
          </div>
        )}

        {tab === "messages" && (
          <div className="pulse-messages">
            <div className="pulse-msg-sidebar">
              <div className="pulse-msg-header">{currentUser.name}</div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {contacts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveThread(c.id);
                      record({ event_type: "MESSAGE_READ", action: "MESSAGE_READ", resource_type: "message", resource_id: `thread-${c.id}` });
                    }}
                    className={`pulse-msg-contact ${activeThread === c.id ? 'active' : ''}`}
                  >
                    <img src={`/images/avatar_${(Number(c.id) % 7) + 1}.jpg`} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} alt={c.name} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{c.name}</span>
                      <span style={{ color: '#888', fontSize: '13px' }}>Tap to chat</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="pulse-chat-area">
              {activeThread == null ? (
                <div style={{ margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: '#888' }}>
                  <Send size={64} color="#555" />
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>Your Messages</div>
                  <div>Send private photos and messages to a friend.</div>
                </div>
              ) : (
                <>
                  <div className="pulse-chat-header">
                    <img src={`/images/avatar_${(Number(activeThread) % 7) + 1}.jpg`} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} alt="contact" />
                    {contacts.find((c) => c.id === activeThread)?.name}
                  </div>
                  <div className="pulse-chat-history">
                    {threads[activeThread] && threads[activeThread].map((msg, i) => (
                      <div key={i} className={`pulse-chat-bubble ${msg.fromMe ? 'me' : 'them'}`}>
                        {msg.text}
                      </div>
                    ))}
                  </div>
                  <div className="pulse-chat-input-area">
                    <div className="pulse-chat-input-box">
                      <input
                        value={messageDraft}
                        onChange={(e) => setMessageDraft(e.target.value)}
                        placeholder="Message..."
                        className="pulse-chat-input"
                      />
                      {messageDraft.trim() && (
                        <button
                          className="pulse-chat-send"
                          onClick={() => {
                            const newThread = [...(threads[activeThread] || []), { text: messageDraft, fromMe: true }];
                            updateData({ ...data, threads: { ...threads, [activeThread]: newThread } });
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
          <div className="pulse-profile">
            <div className="pulse-profile-header">
              <div className="pulse-profile-avatar">
                <img src={`/images/avatar_${(Number(currentUser.id) % 7) + 1}.jpg`} alt={currentUser.name} />
              </div>
              <div className="pulse-profile-info">
                <div className="pulse-profile-name-row">
                  <div className="pulse-profile-name">{currentUser.name}</div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="pulse-btn-secondary" onClick={() => setTab("settings")}>Edit profile</button>
                    <button className="pulse-btn-secondary" onClick={() => record({ event_type: "SETTINGS_CHANGE", action: "SETTINGS_CHANGE", resource_type: "profile" })}>View archive</button>
                  </div>
                </div>
                <div className="pulse-profile-stats">
                  <div><strong>{posts.length}</strong> posts</div>
                  <div><strong>342</strong> followers</div>
                  <div><strong>{contacts.length}</strong> following</div>
                </div>
                <div className="pulse-profile-bio">
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{currentUser.name}</div>
                  <div style={{ color: '#aaa', fontSize: '14px' }}>{currentUser.role} · {currentUser.department}</div>
                </div>
              </div>
            </div>

            <div className="pulse-profile-tabs">
              <div className="pulse-profile-tab active"><Grid size={16}/> Posts</div>
              <div className="pulse-profile-tab"><BookmarkIcon size={16}/> Saved</div>
              <div className="pulse-profile-tab"><Tag size={16}/> Tagged</div>
            </div>

            <div className="pulse-explore-grid">
              {posts.map((p) => (
                <div 
                  key={p.id} 
                  className="pulse-explore-item"
                  style={{ backgroundImage: `url(${(p as any).imageUrl})` }}
                  onClick={() => record({ event_type: "CONTENT_DOWNLOAD", action: "CONTENT_DOWNLOAD", resource_type: "media", resource_id: p.id, data_volume: 180 })}
                ></div>
              ))}
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="pulse-settings">
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '32px' }}>Settings</h2>
            
            <div className="pulse-settings-card">
              <div className="pulse-settings-title"><SettingsIcon size={20}/> Account Privacy</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 500 }}>Private account</span>
                <select
                  value={privacy}
                  onChange={(e) => {
                    setPrivacy(e.target.value);
                    record({ event_type: "SETTINGS_CHANGE", action: "SETTINGS_CHANGE", resource_type: "account_settings", metadata: { field: "visibility", value: e.target.value } });
                  }}
                  className="pulse-select"
                  style={{ width: 'auto', padding: '8px 16px' }}
                >
                  <option>Public</option>
                  <option>Private</option>
                </select>
              </div>
              <div style={{ color: '#888', fontSize: '13px', marginTop: '12px' }}>When your account is public, your profile and posts can be seen by anyone, on or off Pulse.</div>
            </div>

            <div className="pulse-settings-card">
              <div className="pulse-settings-title"><Heart size={20}/> Notifications</div>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <span style={{ fontWeight: 500 }}>Push notifications</span>
                <input
                  type="checkbox"
                  style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#ff007f' }}
                  checked={notifications}
                  onChange={(e) => {
                    setNotifications(e.target.checked);
                    record({ event_type: "SETTINGS_CHANGE", action: "SETTINGS_CHANGE", resource_type: "account_settings", metadata: { field: "notifications", value: e.target.checked } });
                  }}
                />
              </label>
            </div>

            <div className="pulse-settings-card">
              <div className="pulse-settings-title text-red-500" style={{ color: '#ff4444' }}>Reset Mock Data</div>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
                Reset all apps back to their initial static data state.
              </p>
              <button className="pulse-btn-secondary" style={{ color: '#ff4444', borderColor: '#ff4444' }} onClick={async () => {
                await api.post('/mock/reset');
                refresh();
              }}>
                Reset App Data
              </button>
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
      className={`pulse-nav-item ${active ? 'active' : ''}`}
    >
      <div className="pulse-nav-icon">{icon}</div>
      <span className="pulse-nav-label">{label}</span>
    </button>
  );
}

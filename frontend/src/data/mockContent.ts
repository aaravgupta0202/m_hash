import type { UserSummary } from "../types";

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const POST_CAPTIONS = [
  "Great team offsite this week 🎉", "Shipping something new soon…", "Coffee first, code later ☕",
  "Loved connecting with everyone at the summit", "Weekend hike recap", "Proud of what we built this quarter",
  "Throwback to the launch party", "New desk setup, finally!",
];

const EMAIL_SUBJECTS = [
  "Q3 planning notes", "Re: Budget approval needed", "Weekly sync agenda", "Contract renewal - action required",
  "Team lunch on Friday?", "Invoice #4521 attached", "Project Atlas status update", "Following up on our call",
  "Holiday schedule reminder", "Access request approved",
];

const TRANSACTION_MERCHANTS = [
  "Cloud Hosting Co.", "Office Supplies Ltd.", "Business Travel Inc.", "SaaS Subscription", "Client Payment Received",
  "Payroll Deposit", "Catering Services", "Conference Registration", "Software License", "Utility Payment",
];

export function generatePosts(user: UserSummary, contacts: UserSummary[]) {
  const rand = seededRandom(user.id * 7 + 3);
  return Array.from({ length: 8 }, (_, i) => {
    const author = contacts[Math.floor(rand() * contacts.length)] ?? user;
    return {
      id: `post-${user.id}-${i}`,
      author: author.name,
      caption: POST_CAPTIONS[Math.floor(rand() * POST_CAPTIONS.length)],
      likes: Math.floor(rand() * 180) + 5,
      comments: Math.floor(rand() * 20),
      hue: Math.floor(rand() * 360),
    };
  });
}

export function generateEmails(user: UserSummary, contacts: UserSummary[]) {
  const rand = seededRandom(user.id * 11 + 5);
  return Array.from({ length: 12 }, (_, i) => {
    const sender = contacts[Math.floor(rand() * contacts.length)] ?? user;
    const hasAttachment = rand() > 0.6;
    const hoursAgo = Math.floor(rand() * 96);
    return {
      id: `email-${user.id}-${i}`,
      from: sender.name,
      fromEmail: sender.email,
      subject: EMAIL_SUBJECTS[Math.floor(rand() * EMAIL_SUBJECTS.length)],
      snippet: "Hi, just following up on this — let me know if you have any questions or need anything else from my side.",
      unread: rand() > 0.6,
      hasAttachment,
      attachmentName: hasAttachment ? `document-${i}.pdf` : null,
      attachmentSizeKb: Math.floor(rand() * 300) + 40,
      timestamp: new Date(Date.now() - hoursAgo * 3600_000).toISOString(),
    };
  });
}

export function generateTransactions(user: UserSummary) {
  const rand = seededRandom(user.id * 13 + 9);
  return Array.from({ length: 10 }, (_, i) => {
    const isCredit = rand() > 0.7;
    const hoursAgo = Math.floor(rand() * 240);
    return {
      id: `txn-${user.id}-${i}`,
      merchant: TRANSACTION_MERCHANTS[Math.floor(rand() * TRANSACTION_MERCHANTS.length)],
      amount: Math.round((rand() * 2400 + 20) * 100) / 100,
      isCredit,
      timestamp: new Date(Date.now() - hoursAgo * 3600_000).toISOString(),
    };
  });
}

export function generateBeneficiaries(user: UserSummary) {
  const rand = seededRandom(user.id * 17 + 2);
  const names = ["Acme Vendor LLC", "Regional Tax Office", "Cloudline Partners", "J. Whitfield"];
  return names.slice(0, 2 + Math.floor(rand() * 2)).map((name, i) => ({
    id: `bene-${user.id}-${i}`,
    name,
    accountNumber: `••••${1000 + Math.floor(rand() * 8999)}`,
  }));
}

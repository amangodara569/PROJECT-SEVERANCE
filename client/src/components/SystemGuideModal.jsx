import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

// Detailed guide sections with beginner-friendly explanations and examples
const GUIDE_SECTIONS = [
  {
    id: 'overview',
    title: '1. What Is Linked Out?',
    tag: 'Start Here',
    description: 'Linked Out is a safe, honest community for people who have been laid off, are worried about layoffs, or just landed a new job. Think of it as a mix of Reddit and LinkedIn — but built for real talk, not corporate polish.',
    details: [
      {
        heading: 'Why does this exist?',
        text: 'Getting laid off can feel isolating. Linked Out gives you a place to vent, ask questions, track which companies are cutting jobs, find new opportunities, and celebrate when you land something new.'
      },
      {
        heading: 'What can I do here?',
        text: 'Write posts about your experience. Vote on others\' posts. Comment and reply. Browse company-specific communities called "Floors". Track layoff reports. Browse and share job openings.'
      },
      {
        heading: 'Do I have to use my real name?',
        text: 'No! You have two identities. Your "Outie" is your real profile (like LinkedIn). Your "Innie" is a pseudonymous handle like Innie-4821 that hides your identity completely. You can switch between them anytime.'
      }
    ]
  },
  {
    id: 'innie-vs-outie',
    title: '2. Innie vs Outie',
    tag: 'Identity Modes',
    description: 'The core feature of Linked Out. You have two personas — pick the right one depending on how much privacy you need.',
    details: [
      {
        heading: '🌙 Outie Mode (Default)',
        text: 'This is your real identity. Dark background, clean look. Your real @username appears on everything you post. Other users can click your name to see your profile, headline, and public posts. Use Outie when you\'re comfortable being public — like sharing a job listing or celebrating a new hire.'
      },
      {
        heading: '☀️ Innie Mode',
        text: 'This is your private identity. Light background (the colors flip). Instead of your username, everything you post shows a random handle like "Innie-4821". Nobody — not even other users — can see who wrote it. Use Innie when you want to vent about a company, share sensitive experiences, or ask awkward questions.'
      },
      {
        heading: 'How to switch',
        text: 'Click the OUTIE / INNIE toggle button in the top navbar. It switches instantly. The whole color theme changes so you always know which mode you\'re in.'
      },
      {
        heading: 'Example: Outie post',
        text: 'You write: "Just got an offer at StartupZero!" → It shows as: @priya_test · Employed · "Just got an offer at StartupZero!" → Anyone can see it\'s you, visit your profile, and congratulate you.'
      },
      {
        heading: 'Example: Innie post',
        text: 'You switch to Innie and write: "My manager at MegaCorp lied about the PIP process" → It shows as: Innie-2002 · "My manager at MegaCorp lied about the PIP process" → Nobody knows it\'s you. Not even admins see your name on the post.'
      },
      {
        heading: 'Quick Comparison Table',
        text: '• Outie: Real @username shown | Profile visible | Dark theme | Best for: job posts, celebrations, networking\n• Innie: Random Innie-XXXX handle | Profile hidden | Light theme | Best for: venting, sensitive questions, company criticism'
      },
      {
        heading: '⚠️ Important Privacy Note',
        text: 'Innie hides your name from other users. It does NOT hide you from the platform itself. So don\'t post your phone number or personal details — those could still identify you even behind an Innie handle.'
      }
    ]
  },
  {
    id: 'feed',
    title: '3. Feed & Posts',
    tag: 'Community',
    description: 'The home feed is where all the action happens. It\'s a stream of posts from everyone in the community — like a Reddit front page for layoff survivors.',
    details: [
      {
        heading: 'Types of posts',
        text: '• Vent — Let it out. Frustration, anger, dark humor about being laid off. Swearing is allowed.\n• Question — Ask the community anything. "How long did your severance take?" "Is Company X actually hiring?"\n• Hired — Celebrate landing a new job. This triggers a special Waffle Party animation!'
      },
      {
        heading: 'How to create a post',
        text: 'On the Home page, look for the post composer box at the top. Type a title, write your message, pick the post type (Vent / Question / Hired), optionally pick a Floor (company), and click "Post". Your current mode (Innie or Outie) determines whether your name or your Innie handle appears.'
      },
      {
        heading: 'Sorting: NEW vs TOP',
        text: 'Click the "NEW" or "TOP" tabs above the feed.\n• NEW = most recent posts first (like a timeline).\n• TOP = posts with the highest vote score first (most popular).'
      },
      {
        heading: 'Filtering by type',
        text: 'Use the All / Vents / Questions / Hired tabs to show only the type of post you want to see.'
      },
      {
        heading: 'Voting (▲ and ▼)',
        text: 'Every post has up and down arrows.\n• Click ▲ to upvote (you agree, it\'s helpful, or you support it). The score goes up by 1.\n• Click ▼ to downvote (you disagree or it\'s unhelpful). The score goes down by 1.\n• Click the same arrow again to undo your vote.\n• Example: A post has score 12. You click ▲ → it becomes 13. Click ▲ again → back to 12.'
      }
    ]
  },
  {
    id: 'comments',
    title: '4. Comments & Replies',
    tag: 'Discussion',
    description: 'Every post has a comment section. You can leave a top-level comment or reply to someone else\'s comment (one level deep).',
    details: [
      {
        heading: 'How to comment',
        text: 'Open any post by clicking its title. Scroll down to the "Leave a Comment" box. Type your message and click "Comment". Your current Innie/Outie mode applies here too.'
      },
      {
        heading: 'How to reply to a comment',
        text: 'Under any comment, click [ Reply ]. A small text box appears. Write your reply and click "Reply". Replies are shown indented under the original comment.'
      },
      {
        heading: 'Voting on comments',
        text: 'Comments have ▲ and ▼ arrows just like posts. Same rules — click to vote, click again to undo.'
      },
      {
        heading: 'Example',
        text: 'Post: "How long did severance payout take?"\n→ Comment by @aman_test: "Took 21 days for direct deposit."\n  → Reply by Innie-2002: "Watch out for the bonus tax rate — about 35-40%."'
      }
    ]
  },
  {
    id: 'floors',
    title: '5. Company Floors',
    tag: 'Networks',
    description: 'Floors are like subreddits — but each one is tied to a company. If you worked at TechNova, join the TechNova floor to connect with colleagues.',
    details: [
      {
        heading: 'What is a Floor?',
        text: 'A Floor is a community space for people connected to a specific company. It has a name (like "ByteForge"), a description, and a list of members. Posts can be tagged to a Floor so they show up in that company\'s feed.'
      },
      {
        heading: 'How to browse Floors',
        text: 'Click "Floors" in the left sidebar. You\'ll see a list of all company Floors with their member counts. Use the search box to find a specific company.'
      },
      {
        heading: 'How to join or leave a Floor',
        text: 'Open any Floor and click the "Join" button. Once joined, click "Leave" to exit. Joining adds the Floor\'s posts to your view and adds you to the member count.'
      },
      {
        heading: 'How to create a Floor',
        text: 'Click "Floors" → "Create Floor". Enter the company name and a short description. The system generates a URL-safe slug automatically (e.g., "MegaCorp India" becomes "megacorp-india").'
      },
      {
        heading: 'Example',
        text: 'Floor: "MegaCorp India" · 3 members\nDescription: "Ex-MegaCorp and current personnel sharing unvarnished experiences."\nPosts here: vents about MegaCorp\'s layoff process, questions about severance policies, etc.'
      }
    ]
  },
  {
    id: 'tracker',
    title: '6. The Severed Floor',
    tag: 'Layoff Tracker',
    description: 'A real-time, crowdsourced tracker of corporate layoffs. Think of it as a public ledger where anyone can report and verify workforce reductions.',
    details: [
      {
        heading: 'What you see',
        text: 'A big counter at the top shows "Severed This Month" — the total number of people affected by verified layoffs in the current month. Below that is a list of individual reports.'
      },
      {
        heading: 'How to submit a layoff report',
        text: 'Click "Report New Layoff". Enter the company name, approximate number of people affected, the date, an optional news source URL, and a short note. Click submit.'
      },
      {
        heading: 'How confirmation works',
        text: 'Each report shows a "Confirm" button and a trust level (number of confirmations). If you know the report is accurate, click [ Confirm ] to add your verification. More confirms = higher trust. You can only confirm once per report.'
      },
      {
        heading: 'Example',
        text: 'Report: "ByteForge · 210 people · Sept 12, 2026"\nNote: "Global platform consolidation."\nConfirmed by: 6 people ✓\nThis means 6 community members verified that the ByteForge layoff actually happened.'
      }
    ]
  },
  {
    id: 'comeback',
    title: '7. Comeback & Waffle Party',
    tag: 'Recovery',
    description: 'The light at the end of the tunnel. Browse job openings, share opportunities, and celebrate when you land your next role.',
    details: [
      {
        heading: 'Jobs Board',
        text: 'Click "Comeback" in the sidebar. You\'ll see a list of job openings shared by community members. Each card shows the title, company, location, and a direct link to apply.'
      },
      {
        heading: 'How to post a job',
        text: 'Click "Post a Job" on the Comeback page. Enter the job title, company name, location, and the application link. This is for sharing real opportunities — if you\'re hiring or know someone who is.'
      },
      {
        heading: 'The "Hired" post',
        text: 'When you land a new job, create a post with type "Hired" (select it from the dropdown in the Post Composer). Tell the community your story!'
      },
      {
        heading: '🧇 The Waffle Party',
        text: 'When you submit a "Hired" post, something special happens: a full-screen retro celebration animation plays (the "Waffle Party"). Your status badge also changes from "Severed" to "Reintegrated". It\'s the community\'s way of celebrating your comeback.'
      },
      {
        heading: 'Example',
        text: 'Post: "Reintegrated at ByteForge after 5 grueling months"\nType: Hired\nResult: Waffle Party animation plays → your badge changes to ✓ Reintegrated'
      }
    ]
  },
  {
    id: 'moderation',
    title: '8. Break Room & Safety',
    tag: 'Rules',
    description: 'Linked Out allows raw, honest expression — but has clear lines that protect people from doxxing and harassment.',
    details: [
      {
        heading: '✅ What IS allowed',
        text: '• Swearing ("What a f***ing joke of a severance package")\n• Dark humor ("My exit interview had better snacks than my 3 years of work")\n• Harsh criticism of companies and executives\n• Venting anger and frustration about being laid off\n• Speaking pseudonymously through your Innie identity'
      },
      {
        heading: '🚫 What is NOT allowed (Doxxing)',
        text: 'You cannot post phone numbers or personal email addresses. If you try, the "Break Room" screen appears — it blocks your post and asks you to remove the private info before resubmitting. Your text is saved so you don\'t lose your work.'
      },
      {
        heading: 'Example: Break Room trigger',
        text: 'You write: "Contact HR at 555-0199 to complain" → The Break Room appears: "DOXXING DETECTED. Remove personal contact information." → Edit out the phone number → Resubmit successfully.'
      },
      {
        heading: 'Reporting content',
        text: 'Every post and comment has a [ Report ] button. If something violates the rules (targeted harassment, threats), click Report. When an item receives 5 reports from different users, it\'s automatically hidden from the platform.'
      },
      {
        heading: 'Admin Review Queue',
        text: 'Flagged and auto-hidden items go into the Review Queue (visible only to admins). Admins can:\n• "Dismiss Reports" — clears all reports and restores the content to the public feed.\n• "Sever Transmission" — permanently deletes the content and all its comments.'
      }
    ]
  },
  {
    id: 'profile',
    title: '9. Your Profile',
    tag: 'Identity',
    description: 'Your public-facing page where other users can learn about you — but only what you\'ve chosen to share publicly.',
    details: [
      {
        heading: 'What your profile shows',
        text: 'Your @username, headline (like "Backend Dev, ex-Company X"), status badge (Employed / Severed / Reintegrated), bio, and a list of your Outie posts.'
      },
      {
        heading: 'What your profile does NOT show',
        text: 'It never shows your Innie posts. If you wrote 20 Innie vents about your old company, none of them appear on your profile. They are completely disconnected from your public identity.'
      },
      {
        heading: 'Status badges',
        text: '• Employed — You currently have a job.\n• Severed — You\'ve been laid off.\n• Reintegrated — You were laid off but landed a new role (set automatically when you post a "Hired" post).'
      },
      {
        heading: 'How to view someone\'s profile',
        text: 'Click any @username on a post or comment. It takes you to their profile page at /u/username.'
      }
    ]
  }
];

// SystemGuideModal: Pop-up employee onboarding guide explaining every feature
export default function SystemGuideModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState(0);

  if (!isOpen) return null;
  const current = GUIDE_SECTIONS[activeTab];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs font-mono">
      <Card className="w-full max-w-2xl p-6 flex flex-col max-h-[90vh] overflow-hidden bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-4 border-[var(--color-border)]">
          <div>
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-[var(--color-text-primary)]">LINKED OUT — USER MANUAL</h2>
            <p className="text-[11px] text-[var(--color-text-muted)]">Everything you need to know. Click through each section.</p>
          </div>
          <Button variant="ghost" size="xs" onClick={onClose} className="uppercase text-[var(--color-text-muted)]">
            ✕ Close
          </Button>
        </div>

        {/* Navigation tabs — scrollable row */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-4 border-b border-[var(--color-border)] text-[10px]">
          {GUIDE_SECTIONS.map((sec, i) => (
            <button
              key={sec.id}
              onClick={() => setActiveTab(i)}
              className={`px-2.5 py-1 whitespace-nowrap uppercase border transition-colors ${
                i === activeTab
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-bold border-[var(--color-primary)]'
                  : 'bg-transparent text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text-primary)]'
              }`}
              style={{ borderRadius: 'var(--radius-btn)' }}
            >
              {sec.title.split('.')[1]?.trim() || sec.title}
            </button>
          ))}
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold uppercase text-sm text-[var(--color-text-primary)]">{current.title}</span>
              <Badge variant="outline" size="sm" className="text-[9px] uppercase">
                {current.tag}
              </Badge>
            </div>
            <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
              {current.description}
            </p>
          </div>

          {/* Detail blocks with headings */}
          <div className="space-y-3">
            {current.details.map((item, idx) => (
              <div
                key={idx}
                className="p-3 border border-[var(--color-border)] space-y-1.5 bg-[var(--color-bg-subtle)]"
                style={{ borderRadius: 'var(--radius-card)' }}
              >
                <span className="text-[11px] uppercase font-bold tracking-wider block text-[var(--color-text-primary)]">
                  {item.heading}
                </span>
                <p className="text-xs leading-relaxed whitespace-pre-line text-[var(--color-text-secondary)]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4 mt-4">
          <div className="text-[10px] flex items-center gap-3 text-[var(--color-text-muted)]">
            <span>Section {activeTab + 1} of {GUIDE_SECTIONS.length}</span>
            {activeTab > 0 && (
              <Button
                variant="outline"
                size="xs"
                onClick={() => setActiveTab((prev) => prev - 1)}
                className="uppercase text-[10px]"
              >
                ← Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {activeTab < GUIDE_SECTIONS.length - 1 ? (
              <Button
                variant="default"
                size="sm"
                onClick={() => setActiveTab((prev) => prev + 1)}
                className="uppercase tracking-wider font-semibold"
              >
                Next Section →
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={onClose}
                className="uppercase tracking-wider font-semibold"
              >
                Got It — Close Guide
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
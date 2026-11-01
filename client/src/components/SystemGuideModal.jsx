import { useState, useEffect } from 'react';

// Guide chapters detailing all implemented MVP features
const GUIDE_SECTIONS = [
  {
    id: 'sever',
    title: '1. Innie / Outie Severance',
    tag: 'Core Identity',
    description: 'The app features a dual-identity architecture inspired by Severance.',
    details: [
      'Outie Mode (Default): Black background, white text. Posts display your real @username, headline, and public profile.',
      'Innie Mode: Click "INNIE" on the navbar toggle. The UI smoothly inverts to white background, black text. All posts and comments display only your randomized Innie-XXXX handle.',
      'Cryptographic Privacy: The server completely strips your real user ID from API responses for Innie posts, ensuring zero doxxing risk.'
    ]
  },
  {
    id: 'feed',
    title: '2. Feed, Discussions & Voting',
    tag: 'Community',
    description: 'Tell your layoff story honestly without corporate filters.',
    details: [
      'Post Composer: Write vents, questions, or recovery stories. Automatically tags your active Innie or Outie identity.',
      'Vote Controls: Reddit-style ▲ and ▼ buttons dynamically calculate net scores. Clicking the same arrow removes your vote.',
      '1-Level Threaded Comments: Deep nested replies automatically re-attach to root comments to keep discussions legible.',
      'Sorting: Switch seamlessly between NEW (chronological) and TOP (highest net score).'
    ]
  },
  {
    id: 'floors',
    title: '3. Company Floors',
    tag: 'Networks',
    description: 'Dedicated hubs for colleagues from the same enterprise.',
    details: [
      'Browse & Search: Search any company floor or explore member headcounts.',
      'Create a Floor: Anyone can establish a company community in one click.',
      'Join / Leave: Toggle floor membership to keep track of colleagues.'
    ]
  },
  {
    id: 'tracker',
    title: '4. The Severed Floor',
    tag: 'Layoff Tracker',
    description: 'Real-time corporate workforce reduction tracking and verification.',
    details: [
      'Severed This Month: Live monospace counter summing verified layoffs in the current calendar month.',
      'Crowdsourced Reports: Submit company reduction notices with headcount, date, and source links.',
      'Peer Confirmation: Click [ Confirm ] on any report to verify accuracy and build trust.'
    ]
  },
  {
    id: 'comeback',
    title: '5. Comeback & Waffle Party',
    tag: 'Recovery',
    description: 'Celebrating recovery and landing the next role.',
    details: [
      'Jobs Board: Post and browse open job opportunities with direct application links.',
      'I Got Hired: Share a recovery post with type "Hired".',
      'The Waffle Party: Submitting a hired post unlocks a full-screen retro celebration and upgrades your badge to Reintegrated.'
    ]
  },
  {
    id: 'moderation',
    title: '6. The Break Room & Safety',
    tag: 'Language Rules',
    description: 'Free words, not free targets.',
    details: [
      'Allowed: Swearing, dark humor, anger, and harsh criticism of corporate management are 100% permitted.',
      'Forbidden (Doxxing): Posting phone numbers or personal emails triggers the Break Room modal, holding the post for editing.',
      'Community Moderation: 5 reports on any item automatically hide it from the platform.'
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
      <div
        className="w-full max-w-xl p-6 border flex flex-col max-h-[90vh] overflow-hidden"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--text)',
          borderRadius: '2px'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-4" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase">SYSTEM PROTOCOL & FEATURE GUIDE</h2>
            <p className="text-[11px]" style={{ color: 'var(--muted)' }}>Orientation for Severed & Outie Personnel</p>
          </div>
          <button
            onClick={onClose}
            className="text-xs px-2 py-1 border hover:opacity-80 uppercase"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'transparent' }}
          >
            ✕ Close
          </button>
        </div>

        {/* Navigation tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2 mb-4 border-b text-[10px]" style={{ borderColor: 'var(--border)' }}>
          {GUIDE_SECTIONS.map((sec, i) => (
            <button
              key={sec.id}
              onClick={() => setActiveTab(i)}
              className={`px-2.5 py-1 whitespace-nowrap uppercase border ${i === activeTab ? 'font-bold' : ''}`}
              style={{
                backgroundColor: i === activeTab ? 'var(--text)' : 'transparent',
                color: i === activeTab ? 'var(--bg)' : 'var(--muted)',
                borderColor: 'var(--border)'
              }}
            >
              {sec.title.split('.')[1]?.trim() || sec.title}
            </button>
          ))}
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold uppercase text-sm" style={{ color: 'var(--text)' }}>{current.title}</span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 border" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                {current.tag}
              </span>
            </div>
            <p className="font-sans text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
              {current.description}
            </p>
          </div>

          <div className="p-3 border space-y-2" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
            <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--text)' }}>
              How It Works & How To Use:
            </span>
            <ul className="space-y-2 font-sans text-xs" style={{ color: 'var(--muted)' }}>
              {current.details.map((detail, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--text)' }}>▸</span>
                  <span className="leading-relaxed">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t pt-4 mt-4" style={{ borderColor: 'var(--border)' }}>
          <div className="text-[10px]" style={{ color: 'var(--muted)' }}>
            Section {activeTab + 1} of {GUIDE_SECTIONS.length}
          </div>
          <div className="flex gap-2">
            {activeTab < GUIDE_SECTIONS.length - 1 ? (
              <button
                onClick={() => setActiveTab((prev) => prev + 1)}
                className="px-4 py-1.5 text-xs uppercase tracking-wider font-semibold border"
                style={{ backgroundColor: 'var(--text)', color: 'var(--bg)', borderColor: 'var(--text)' }}
              >
                Next Section →
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs uppercase tracking-wider font-semibold border"
                style={{ backgroundColor: 'var(--text)', color: 'var(--bg)', borderColor: 'var(--text)' }}
              >
                Acknowledge Protocols
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


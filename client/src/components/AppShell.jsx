import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { X } from 'lucide-react';
import TopBar from './TopBar';
import LeftNav from './LeftNav';
import RightRail from './RightRail';
import MobileTabBar from './MobileTabBar';
import PostComposer from './PostComposer';

// Main application frame with hairline column dividers and responsive navigation
export default function AppShell() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showComposerModal, setShowComposerModal] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] relative">
      {/* Fixed TopBar (56px) */}
      <TopBar
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        isMobileNavOpen={isMobileNavOpen}
        onOpenComposer={() => setShowComposerModal(true)}
      />

      {/* Mobile Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="relative z-10 w-72 bg-[var(--surface)] h-full border-r border-[var(--border)]">
            <LeftNav isMobile={true} onCloseMobile={() => setIsMobileNavOpen(false)} />
          </div>
        </div>
      )}

      {/* Multi-Column Layout: balanced column proportions, borderless layout */}
      <div className="pt-14 w-full flex justify-center pb-16 md:pb-0">
        <div className="w-full max-w-[1440px] px-6 grid grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[240px_minmax(0,1fr)_280px] gap-8 justify-center">
          {/* Left Column (No border divider) */}
          <div className="hidden md:block">
            <LeftNav />
          </div>

          {/* Center Column (Feed) */}
          <main className="w-full min-w-0">
            <Outlet context={{ onOpenComposer: () => setShowComposerModal(true) }} />
          </main>

          {/* Right Column (No border divider) */}
          <div className="hidden lg:block sticky top-14 h-[calc(100vh-56px)] overflow-y-auto pt-2">
            <RightRail />
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <MobileTabBar />

      {/* Direct Post Composer Modal (no preliminary teaser window) */}
      {showComposerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-lg p-5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
              <span className="font-semibold text-sm text-[var(--text)] font-head">
                New post
              </span>
              <button
                type="button"
                onClick={() => setShowComposerModal(false)}
                className="text-[var(--muted)] hover:text-[var(--text)] p-1 cursor-pointer transition-colors"
                aria-label="Close dialog"
              >
                <X size={16} />
              </button>
            </div>
            <PostComposer
              initialOpen={true}
              onPostCreated={() => {
                setShowComposerModal(false);
                window.location.reload();
              }}
              onCancel={() => setShowComposerModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

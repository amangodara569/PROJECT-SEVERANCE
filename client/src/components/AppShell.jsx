import { useState } from 'react';
import { Outlet } from 'react-router-dom';
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

      {/* Multi-Column Layout: hairline dividers, no boxes */}
      <div className="pt-14 w-full flex justify-center pb-16 md:pb-0">
        <div className="w-full max-w-[1400px] grid grid-cols-1 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_minmax(0,700px)_320px] justify-center">
          {/* Left Column (240px) */}
          <div className="hidden md:block border-r border-[var(--border)]">
            <LeftNav />
          </div>

          {/* Center Column (Feed up to 700px) */}
          <main className="w-full min-w-0 overflow-x-hidden">
            <Outlet context={{ onOpenComposer: () => setShowComposerModal(true) }} />
          </main>

          {/* Right Column (320px) */}
          <div className="hidden lg:block sticky top-14 h-[calc(100vh-56px)] overflow-y-auto p-4 border-l border-[var(--border)]">
            <RightRail />
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <MobileTabBar />

      {/* Optional Composer Modal */}
      {showComposerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-lg p-5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
              <span className="font-semibold text-sm text-[var(--text)]">
                New post
              </span>
              <button
                type="button"
                onClick={() => setShowComposerModal(false)}
                className="text-xs text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
              >
                Close
              </button>
            </div>
            <PostComposer
              onPostCreated={() => {
                setShowComposerModal(false);
                window.location.reload();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

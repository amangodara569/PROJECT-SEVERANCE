import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import LeftNav from './LeftNav';
import RightRail from './RightRail';
import MobileTabBar from './MobileTabBar';
import EdgeTexture from './EdgeTexture';
import PostComposer from './PostComposer';

export default function AppShell() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [showComposerModal, setShowComposerModal] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-bg-canvas)] text-[var(--color-text-primary)] relative">
      {/* 1. Macrodata Edge Texture on wide monitors (>=1680px) */}
      <EdgeTexture />

      {/* 2. Fixed TopBar (56px) */}
      <TopBar
        onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
        isMobileNavOpen={isMobileNavOpen}
        onOpenComposer={() => setShowComposerModal(true)}
      />

      {/* 3. Mobile Navigation Drawer (<768px) */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <div className="relative z-10 w-72 bg-[var(--color-bg-card)] h-full shadow-2xl">
            <LeftNav isMobile={true} onCloseMobile={() => setIsMobileNavOpen(false)} />
          </div>
        </div>
      )}

      {/* 4. Main Multi-Column Grid Container */}
      <div className="pt-14 w-full flex justify-center pb-16 md:pb-0">
        <div className="w-full max-w-[1560px] grid grid-cols-1 md:grid-cols-[72px_1fr] xl:grid-cols-[260px_minmax(0,700px)_360px] 2xl:grid-cols-[300px_minmax(0,760px)_420px] justify-center">
          {/* Left Column (Sticky Left Navigation) */}
          <div className="hidden md:block">
            <LeftNav />
          </div>

          {/* Center Column (Feed / Primary Content) */}
          <main className="w-full min-w-0 p-3 sm:p-4 lg:p-6 overflow-x-hidden">
            <Outlet context={{ onOpenComposer: () => setShowComposerModal(true) }} />
          </main>

          {/* Right Column (Sticky Right Rail) */}
          <div className="hidden xl:block sticky top-14 h-[calc(100vh-56px)] overflow-y-auto p-4 border-l border-[var(--color-border)]">
            <RightRail />
          </div>
        </div>
      </div>

      {/* 5. Mobile Bottom Tab Bar */}
      <MobileTabBar />

      {/* Optional Composer Modal from + Create button */}
      {showComposerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-mono">
          <div
            className="w-full max-w-lg p-5 bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-2xl"
            style={{ borderRadius: 'var(--radius-card)' }}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border)]">
              <span className="font-bold text-xs uppercase text-[var(--color-text-primary)]">
                // TRANSMIT TO PLATFORM
              </span>
              <button
                type="button"
                onClick={() => setShowComposerModal(false)}
                className="text-xs uppercase text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              >
                ✕ Close
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
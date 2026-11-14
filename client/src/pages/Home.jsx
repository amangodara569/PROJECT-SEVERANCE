import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlignJustify, List, Pin, ArrowUpRight, Plus, Check } from 'lucide-react';
import api from '../api/api';
import PostComposer from '../components/PostComposer';
import PostCard from '../components/PostCard';
import FloorsRow from '../components/FloorsRow';
import OnboardingCard from '../components/OnboardingCard';
import AsciiArt from '../components/AsciiArt';
import ErrorState from '../components/ErrorState';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'my-floors'
  const [sort, setSort] = useState('new'); // 'new' | 'top'
  const [timeFilter, setTimeFilter] = useState('all'); // 'today' | 'week' | 'month' | 'all'
  const [density, setDensity] = useState(() => localStorage.getItem('linkedout:density') || 'comfortable');

  const [floors, setFloors] = useState([]);
  const [suggestedFloors, setSuggestedFloors] = useState([]);
  const [severedSnapshot, setSeveredSnapshot] = useState({ total: 0, reports: [] });
  const [hiringNow, setHiringNow] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  // Persist density toggle
  const toggleDensity = () => {
    const next = density === 'comfortable' ? 'compact' : 'comfortable';
    setDensity(next);
    localStorage.setItem('linkedout:density', next);
  };

  // Load floors & inline cards data
  useEffect(() => {
    const loadAuxData = async () => {
      try {
        const [floorsRes, layoffsRes, statsRes, jobsRes] = await Promise.all([
          api.get('/floors'),
          api.get('/layoffs'),
          api.get('/stats/overview'),
          api.get('/jobs')
        ]);

        const allFloors = floorsRes.data.floors || [];
        setFloors(allFloors.filter((f) => f.isMember));
        setSuggestedFloors(allFloors.slice(0, 5));

        setSeveredSnapshot({
          total: statsRes.data.severedThisMonth || 0,
          reports: (layoffsRes.data.layoffs || []).slice(0, 3)
        });

        setHiringNow((jobsRes.data.jobs || []).slice(0, 2));
      } catch (e) {
        console.error('Aux data error:', e);
      }
    };
    loadAuxData();
  }, [user]);

  // Fetch posts feed
  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const timeParam = sort === 'top' && timeFilter !== 'all' ? `&time=${timeFilter}` : '';
      const res = await api.get(`/posts?sort=${sort}${timeParam}&limit=20`);
      let items = res.data.posts || res.data.items || [];

      // Filter by My Floors if tab is active
      if (activeTab === 'my-floors' && user) {
        items = items.filter((p) => p.floor && floors.some((f) => f._id === p.floor._id));
      }

      setPosts(items);
      setNextCursor(res.data.nextCursor || null);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.response?.data?.error || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [sort, timeFilter, activeTab]);

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const timeParam = sort === 'top' && timeFilter !== 'all' ? `&time=${timeFilter}` : '';
      const res = await api.get(`/posts?sort=${sort}${timeParam}&limit=20&cursor=${encodeURIComponent(nextCursor)}`);
      const items = res.data.posts || res.data.items || [];
      setPosts((prev) => [...prev, ...items]);
      setNextCursor(res.data.nextCursor || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleVote = async (postId, value) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id !== postId) return p;
        const currentVote = p.userVote ?? p.myVote ?? 0;
        let delta = 0;
        let nextVote = 0;
        if (currentVote === value) {
          delta = -value;
          nextVote = 0;
        } else {
          delta = value - currentVote;
          nextVote = value;
        }
        return {
          ...p,
          score: (p.score || 0) + delta,
          userVote: nextVote,
          myVote: nextVote
        };
      })
    );

    try {
      await api.post(`/posts/${postId}/vote`, { value });
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinInlineFloor = async (slug, id) => {
    try {
      await api.post(`/floors/${slug}/join`);
      setSuggestedFloors((prev) =>
        prev.map((f) => (f._id === id ? { ...f, isMember: true, memberCount: f.memberCount + 1 } : f))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto font-mono text-xs">
      {/* 1. Floors Row (Instagram stories style) */}
      <FloorsRow floors={floors} suggestedFloors={suggestedFloors} />

      {/* 2. Onboarding Card for new users */}
      <OnboardingCard joinedCount={floors.length} postCount={posts.filter((p) => p.isOwner).length} />

      {/* 3. Composer Card (X style) */}
      <PostComposer onPostCreated={handlePostCreated} />

      {/* 4. Tabs, Sort Bar, & Density Toggle (Reddit style) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 border-y border-[var(--color-border)] bg-[var(--color-bg-card)]">
        {/* Left: ALL | MY FLOORS */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 font-bold uppercase transition-colors border ${
              activeTab === 'all'
                ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] border-[var(--color-primary)]'
                : 'text-[var(--color-text-muted)] border-transparent hover:text-[var(--color-text-primary)]'
            }`}
            style={{ borderRadius: 'var(--radius-btn)' }}
          >
            ALL
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('my-floors')}
            className={`px-3 py-1 font-bold uppercase transition-colors border ${
              activeTab === 'my-floors'
                ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] border-[var(--color-primary)]'
                : 'text-[var(--color-text-muted)] border-transparent hover:text-[var(--color-text-primary)]'
            }`}
            style={{ borderRadius: 'var(--radius-btn)' }}
          >
            MY FLOORS ({floors.length})
          </button>
        </div>

        {/* Center/Right: Sort Switcher & Time Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-[var(--color-border)] p-0.5 rounded-sm bg-[var(--color-bg-subtle)]">
            <button
              type="button"
              onClick={() => setSort('new')}
              className={`px-2 py-0.5 uppercase text-[10px] ${
                sort === 'new' ? 'font-bold text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
              }`}
            >
              NEW
            </button>
            <span className="text-[var(--color-border)]">|</span>
            <button
              type="button"
              onClick={() => setSort('top')}
              className={`px-2 py-0.5 uppercase text-[10px] ${
                sort === 'top' ? 'font-bold text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
              }`}
            >
              TOP
            </button>
          </div>

          {/* Time Filter when TOP is active */}
          {sort === 'top' && (
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="p-1 text-[10px] font-mono bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-sm"
            >
              <option value="today">Today</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="all">All Time</option>
            </select>
          )}

          {/* Density toggle button */}
          <button
            type="button"
            onClick={toggleDensity}
            title={`Switch to ${density === 'comfortable' ? 'Compact' : 'Comfortable'} mode`}
            className="p-1.5 border border-[var(--color-border)] hover:border-[var(--color-primary)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors rounded-sm"
          >
            {density === 'comfortable' ? <AlignJustify size={14} /> : <List size={14} />}
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && <ErrorState message={error} onRetry={fetchPosts} />}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border border-[var(--color-border)] bg-[var(--color-bg-card)] space-y-2 animate-pulse">
              <div className="h-4 bg-[var(--color-bg-subtle)] w-1/3 rounded-xs" />
              <div className="h-5 bg-[var(--color-bg-subtle)] w-3/4 rounded-xs" />
              <div className="h-12 bg-[var(--color-bg-subtle)] w-full rounded-xs" />
            </div>
          ))}
        </div>
      )}

      {/* Feed List with Inline Cards */}
      {!loading && (
        <div className="space-y-3">
          {posts.map((post, idx) => (
            <div key={post._id} className="space-y-3">
              <PostCard
                post={post}
                onVote={handleVote}
                density={density}
                onDelete={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
              />

              {/* Inline Card 1: Suggested floors after post 3 */}
              {idx === 2 && suggestedFloors.length > 0 && (
                <Card className="p-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
                      // SUGGESTED FLOORS FOR YOU
                    </span>
                    <Link to="/floors" className="text-[10px] text-[var(--color-primary)] hover:underline">
                      View all floors →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {suggestedFloors.slice(0, 3).map((f) => (
                      <div key={f._id} className="p-2 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] flex flex-col justify-between gap-2" style={{ borderRadius: 'var(--radius-card)' }}>
                        <div>
                          <span className="font-bold text-[var(--color-text-primary)] block truncate">#{f.name}</span>
                          <span className="text-[10px] text-[var(--color-text-muted)]">{f.memberCount} members</span>
                        </div>
                        {f.isMember ? (
                          <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                            <Check size={12} /> Joined
                          </span>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => handleJoinInlineFloor(f.slug, f._id)}
                            className="uppercase text-[9px] w-full"
                          >
                            Join Floor
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Inline Card 2: Severed Floor snapshot after post 6 */}
              {idx === 5 && (
                <Card className="p-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block">
                        // SEVERED FLOOR TELEMETRY
                      </span>
                      <h4 className="font-bold text-xs text-[var(--color-text-primary)]">
                        {severedSnapshot.total.toLocaleString()} personnel severed this month
                      </h4>
                    </div>
                    <Button asChild variant="outline" size="xs">
                      <Link to="/severed-floor">Live Tracker →</Link>
                    </Button>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {severedSnapshot.reports.map((r) => (
                      <div key={r._id} className="flex items-center justify-between text-[11px] border-b border-[var(--color-border)] pb-1 last:border-b-0">
                        <span className="font-semibold text-[var(--color-text-primary)]">{r.company}</span>
                        <Badge variant="outline" size="sm">-{r.people} people</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Inline Card 3: Hiring now after post 9 */}
              {idx === 8 && hiringNow.length > 0 && (
                <Card className="p-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
                      // HIRING OPPORTUNITIES // THE COMEBACK
                    </span>
                    <Link to="/comeback" className="text-[10px] text-[var(--color-primary)] hover:underline">
                      Jobs Board →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {hiringNow.map((job) => (
                      <div key={job._id} className="p-2 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] space-y-1" style={{ borderRadius: 'var(--radius-card)' }}>
                        <a href={job.link} target="_blank" rel="noreferrer" className="font-bold text-xs hover:underline block truncate text-[var(--color-text-primary)]">
                          {job.title}
                        </a>
                        <span className="text-[10px] text-[var(--color-text-muted)] block">
                          {job.company} · {job.location || 'Remote'}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          ))}

          {/* Sparse Feed Handling: if < 5 posts, display inline cards and composer trigger */}
          {posts.length < 5 && (
            <div className="space-y-3 pt-2">
              <Card className="p-6 text-center space-y-2 bg-[var(--color-bg-card)] border border-dashed border-[var(--color-border)]">
                <AsciiArt piece="empty-no-results" size={10} still={true} tone="muted" />
                <h3 className="font-bold text-xs uppercase text-[var(--color-text-primary)]">
                  Feed is sparse. Be the first to write.
                </h3>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  Share unvarnished reports from your company floor. Swearing allowed. Anonymity preserved in Innie mode.
                </p>
              </Card>

              {/* Suggested floors inline */}
              <Card className="p-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] space-y-3">
                <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block">
                  // DISCOVER FLOORS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {suggestedFloors.slice(0, 3).map((f) => (
                    <div key={f._id} className="p-2 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] space-y-1" style={{ borderRadius: 'var(--radius-card)' }}>
                      <span className="font-bold text-[var(--color-text-primary)] block truncate">#{f.name}</span>
                      <span className="text-[10px] text-[var(--color-text-muted)] block">{f.memberCount} members</span>
                      <Button asChild variant="outline" size="xs" className="w-full text-[9px] uppercase mt-1">
                        <Link to={`/floors/${f.slug}`}>Visit</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Load More Button */}
          {nextCursor && (
            <div className="pt-3 text-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loadingMore}
                onClick={handleLoadMore}
                className="w-full font-mono text-xs uppercase font-semibold"
              >
                {loadingMore ? 'Retrieving next transmission...' : 'Load More Transmissions'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, TrendingUp, Users, Briefcase, Activity, Check } from 'lucide-react';
import api from '../api/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../context/AuthContext';

// Converts an array of 30 numbers into a mini ASCII/block bar chart
const renderMiniBarChart = (numbers = []) => {
  if (!numbers || numbers.length === 0) return ' ';
  const max = Math.max(...numbers, 1);
  const blocks = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  return numbers
    .slice(-30)
    .map((val) => {
      if (val === 0) return ' ';
      const idx = Math.min(Math.floor((val / max) * blocks.length), blocks.length - 1);
      return blocks[idx];
    })
    .join('');
};

export default function RightRail({ floorContext = null, postContext = null }) {
  const { user } = useAuth();
  const location = useLocation();

  const [overview, setOverview] = useState({ severedThisMonth: 0, severedByDay: [] });
  const [latestLayoffs, setLatestLayoffs] = useState([]);
  const [popularFloors, setPopularFloors] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [hiringJobs, setHiringJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load right rail data
  useEffect(() => {
    const loadModules = async () => {
      try {
        const [statsRes, layoffsRes, floorsRes, trendingRes, jobsRes] = await Promise.all([
          api.get('/stats/overview'),
          api.get('/layoffs'),
          api.get('/floors?sort=members&limit=5'),
          api.get('/posts/trending?limit=3'),
          api.get('/jobs')
        ]);

        setOverview(statsRes.data || { severedThisMonth: 0, severedByDay: [] });
        setLatestLayoffs((layoffsRes.data.layoffs || []).slice(0, 5));
        setPopularFloors(floorsRes.data.floors || []);
        setTrendingPosts(trendingRes.data.posts || []);
        setHiringJobs((jobsRes.data.jobs || []).slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadModules();
  }, []);

  const handleJoinFloor = async (id, slug) => {
    try {
      await api.post(`/floors/${slug}/join`);
      setPopularFloors((prev) =>
        prev.map((f) => (f._id === id ? { ...f, isMember: true, memberCount: f.memberCount + 1 } : f))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <aside className="w-full space-y-4 font-mono text-xs select-none">
      {/* Contextual Floor About card when viewing a Floor or Post */}
      {(floorContext || (postContext && postContext.floor)) && (
        <Card className="p-4 space-y-3 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] block">
            // ABOUT THIS FLOOR
          </span>
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
              #{floorContext?.name || postContext?.floor?.name}
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              {floorContext?.description || 'Corporate community hub.'}
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)] text-[11px]">
            <span className="text-[var(--color-text-muted)]">
              {floorContext?.memberCount || 1} members
            </span>
            <Link to="/handbook" className="text-[var(--color-primary)] hover:underline">
              Rules & Protocol
            </Link>
          </div>
        </Card>
      )}

      {/* 1. Severed This Month */}
      <Card className="p-4 space-y-2 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
            // SEVERED THIS MONTH
          </span>
          <Link to="/severed-floor" className="text-[10px] text-[var(--color-primary)] hover:underline flex items-center gap-0.5">
            Ledger <ArrowUpRight size={11} />
          </Link>
        </div>
        <div className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
          {overview.severedThisMonth.toLocaleString()}
          <span className="text-xs font-normal text-[var(--color-text-muted)] ml-1.5">people</span>
        </div>
        {/* 30-day block character chart */}
        <div className="pt-1">
          <div className="text-[11px] font-mono tracking-widest text-[var(--color-primary)] overflow-hidden text-ellipsis whitespace-nowrap bg-[var(--color-bg-subtle)] p-1.5 border border-[var(--color-border)]">
            {renderMiniBarChart(overview.severedByDay)}
          </div>
          <span className="text-[9px] text-[var(--color-text-muted)] mt-1 block">30-day corporate telemetry</span>
        </div>
      </Card>

      {/* 2. Latest Layoffs */}
      <Card className="p-4 space-y-2.5 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
            // LATEST LAYOFFS
          </span>
          <Link to="/severed-floor" className="text-[10px] text-[var(--color-primary)] hover:underline">
            See all
          </Link>
        </div>
        {latestLayoffs.length === 0 ? (
          <p className="text-[11px] text-[var(--color-text-muted)] py-2">No reports recorded.</p>
        ) : (
          <div className="space-y-2">
            {latestLayoffs.map((item) => (
              <div key={item._id} className="flex items-center justify-between text-[11px] border-b border-[var(--color-border)] pb-1.5 last:border-b-0">
                <div className="truncate pr-2">
                  <span className="font-semibold text-[var(--color-text-primary)]">{item.company}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] block">
                    {new Date(item.date || item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <Badge variant="outline" size="sm" className="shrink-0 text-[10px]">
                  -{item.people}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 3. Popular Floors (Reddit style) */}
      <Card className="p-4 space-y-2.5 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
            // POPULAR FLOORS
          </span>
          <Link to="/floors" className="text-[10px] text-[var(--color-primary)] hover:underline">
            Explore
          </Link>
        </div>
        {popularFloors.length === 0 ? (
          <p className="text-[11px] text-[var(--color-text-muted)] py-2">No active floors.</p>
        ) : (
          <div className="space-y-2">
            {popularFloors.map((floor) => (
              <div key={floor._id} className="flex items-center justify-between text-[11px]">
                <Link to={`/floors/${floor.slug}`} className="truncate hover:underline">
                  <span className="font-semibold text-[var(--color-text-primary)]">#{floor.name}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] block">{floor.memberCount} members</span>
                </Link>
                {floor.isMember ? (
                  <span className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                    <Check size={12} /> Joined
                  </span>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => handleJoinFloor(floor._id, floor.slug)}
                    className="text-[10px] uppercase font-mono px-2 py-0.5"
                  >
                    Join
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 4. Trending Today */}
      <Card className="p-4 space-y-2.5 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] flex items-center gap-1">
            <TrendingUp size={12} /> // TRENDING TODAY
          </span>
        </div>
        {trendingPosts.length === 0 ? (
          <p className="text-[11px] text-[var(--color-text-muted)] py-2">No trending posts in last 24h.</p>
        ) : (
          <div className="space-y-2">
            {trendingPosts.map((post) => (
              <Link
                key={post._id}
                to={`/posts/${post._id}`}
                className="block p-1.5 hover:bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)] last:border-b-0 transition-colors"
              >
                <span className="line-clamp-2 font-semibold text-[var(--color-text-primary)] text-[11px]">
                  {post.title}
                </span>
                <span className="text-[9px] text-[var(--color-text-muted)] mt-0.5 block">
                  ▲ {post.score || 0} · {post.commentCount || 0} comments
                </span>
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* 5. Hiring Now */}
      <Card className="p-4 space-y-2.5 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] flex items-center gap-1">
            <Briefcase size={12} /> // HIRING NOW
          </span>
          <Link to="/comeback" className="text-[10px] text-[var(--color-primary)] hover:underline">
            Jobs
          </Link>
        </div>
        {hiringJobs.length === 0 ? (
          <p className="text-[11px] text-[var(--color-text-muted)] py-2">No jobs posted yet.</p>
        ) : (
          <div className="space-y-2">
            {hiringJobs.map((job) => (
              <div key={job._id} className="text-[11px] border-b border-[var(--color-border)] pb-1.5 last:border-b-0">
                <a
                  href={job.link}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[var(--color-text-primary)] hover:underline line-clamp-1"
                >
                  {job.title}
                </a>
                <span className="text-[10px] text-[var(--color-text-muted)] block">
                  {job.company} · {job.location || 'Remote'}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 6. Footer */}
      <footer className="pt-2 text-[10px] text-[var(--color-text-muted)] text-center space-y-1">
        <div className="flex justify-center gap-2">
          <Link to="/handbook" className="hover:underline">Handbook</Link>
          <span>·</span>
          <Link to="/wellness" className="hover:underline">Wellness</Link>
          <span>·</span>
          <a href="https://www.ascii-magic.com/ascii" target="_blank" rel="noreferrer" className="hover:underline">
            ASCII credit
          </a>
        </div>
        <p className="italic">"Please enjoy all facts equally."</p>
      </footer>
    </aside>
  );
}
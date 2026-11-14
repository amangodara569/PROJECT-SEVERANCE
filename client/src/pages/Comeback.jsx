import { useState, useEffect } from 'react';
import api from '../api/api';
import JobCard from '../components/JobCard';
import PostCard from '../components/PostCard';
import PostComposer from '../components/PostComposer';
import WaffleParty from '../components/WaffleParty';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Briefcase, Sparkles, Filter } from 'lucide-react';

const JOB_FILTERS = ['All', 'Remote', 'Engineering', 'Security', 'Frontend', 'Platform'];

export default function Comeback() {
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'reintegrated'
  const [jobs, setJobs] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [hiredPosts, setHiredPosts] = useState([]);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showHiredComposer, setShowHiredComposer] = useState(false);
  const [showWaffle, setShowWaffle] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [link, setLink] = useState('');

  const loadData = async () => {
    try {
      const [jobRes, postRes] = await Promise.all([
        api.get('/jobs'),
        api.get('/posts')
      ]);
      setJobs(jobRes.data.jobs || []);
      const allPosts = postRes.data.posts || postRes.data.items || [];
      setHiredPosts(allPosts.filter((p) => p.type === 'hired'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/jobs', { title: jobTitle, company, location, link });
      setJobTitle('');
      setCompany('');
      setLocation('');
      setLink('');
      setShowJobForm(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post job');
    }
  };

  const handleHiredCreated = (post) => {
    setShowHiredComposer(false);
    setHiredPosts((prev) => [post, ...prev]);
    setShowWaffle(true);
  };

  const filteredJobs = jobs.filter((j) => {
    if (selectedFilter === 'All') return true;
    const matchLoc = (j.location || '').toLowerCase().includes(selectedFilter.toLowerCase());
    const matchTitle = (j.title || '').toLowerCase().includes(selectedFilter.toLowerCase());
    return matchLoc || matchTitle;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-mono text-xs">
      {showWaffle && <WaffleParty onContinue={() => setShowWaffle(false)} />}

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <div>
          <h1 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)]">
            // THE COMEBACK // RECOVERY & OPPORTUNITIES
          </h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            Verified opportunities for severed talent and reintegration celebrations.
          </p>
        </div>

        {activeTab === 'jobs' ? (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => setShowJobForm(!showJobForm)}
            className="uppercase font-semibold flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>{showJobForm ? 'Close' : 'Post an Opportunity'}</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => setShowHiredComposer(!showHiredComposer)}
            className="uppercase font-semibold flex items-center gap-1.5"
          >
            <Sparkles size={14} />
            <span>{showHiredComposer ? 'Close' : 'Transmit Reintegration'}</span>
          </Button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('jobs')}
          className={`px-3 py-1.5 font-bold uppercase transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'jobs'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Briefcase size={13} />
          <span>JOBS ({jobs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reintegrated')}
          className={`px-3 py-1.5 font-bold uppercase transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'reintegrated'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <span>🧇</span>
          <span>REINTEGRATED STORIES ({hiredPosts.length})</span>
        </button>
      </div>

      {/* Inline Job Creation Form */}
      {showJobForm && (
        <Card className="p-4 space-y-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-lg">
          <form onSubmit={handleJobSubmit} className="space-y-3">
            <h3 className="uppercase font-bold tracking-wider text-[var(--color-text-primary)]">Publish Verified Opportunity</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input required placeholder="Role Title (e.g. Staff Infrastructure Engineer)" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="text-xs font-mono" />
              <Input required placeholder="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} className="text-xs font-mono" />
              <Input placeholder="Location (e.g. Remote / NYC)" value={location} onChange={(e) => setLocation(e.target.value)} className="text-xs font-mono" />
              <Input required type="url" placeholder="Direct Application URL" value={link} onChange={(e) => setLink(e.target.value)} className="text-xs font-mono" />
            </div>
            <Button type="submit" variant="default" size="sm" className="uppercase font-semibold">
              Publish Role
            </Button>
          </form>
        </Card>
      )}

      {/* Inline Hired Post Composer */}
      {showHiredComposer && (
        <Card className="p-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-lg">
          <PostComposer onPostCreated={handleHiredCreated} />
        </Card>
      )}

      {/* Tab 1: JOBS GRID WITH FILTER CHIPS */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] mr-1 flex items-center gap-1">
              <Filter size={11} /> Filter:
            </span>
            {JOB_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setSelectedFilter(f)}
                className={`px-2.5 py-0.5 text-[10px] uppercase font-bold transition-colors border ${
                  selectedFilter === f
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] border-[var(--color-primary)]'
                    : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text-primary)]'
                }`}
                style={{ borderRadius: 'var(--radius-btn)' }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* 2 to 3 Columns Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-28 border border-[var(--color-border)] bg-[var(--color-bg-card)] animate-pulse" />
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <Card className="p-8 text-center text-[var(--color-text-muted)] bg-[var(--color-bg-card)] border border-[var(--color-border)]">
              No open roles found matching "{selectedFilter}".
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredJobs.map((j) => (
                <JobCard key={j._id} job={j} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: REINTEGRATED STORIES */}
      {activeTab === 'reintegrated' && (
        <div className="space-y-6">
          {/* Horizontal Row of Reintegration Story Cards (Instagram style) */}
          {hiredPosts.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block">
                // WAFFLE PARTY ARCHIVES // REINTEGRATED PERSONNEL
              </span>
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                {hiredPosts.map((hp) => (
                  <div
                    key={hp._id}
                    className="w-48 h-28 p-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all flex flex-col justify-between shrink-0 shadow-xs"
                    style={{ borderRadius: 'var(--radius-card)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">🧇</span>
                      <span className="font-bold text-xs text-[var(--color-text-primary)] truncate">
                        {hp.isInnie ? hp.innieHandle : `@${hp.author?.username}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                      {hp.title}
                    </p>
                    <span className="text-[9px] text-[#007a5a] font-bold uppercase">
                      ✓ Reintegrated
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Post Cards List */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block">
              // COMPLETE REINTEGRATION LOG
            </span>
            {hiredPosts.length === 0 ? (
              <Card className="p-8 text-center text-[var(--color-text-muted)] bg-[var(--color-bg-card)] border border-[var(--color-border)]">
                No reintegration transmissions recorded yet.
              </Card>
            ) : (
              hiredPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
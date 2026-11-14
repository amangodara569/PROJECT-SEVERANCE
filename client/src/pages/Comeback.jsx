import { useState, useEffect } from 'react';
import api from '../api/api';
import JobCard from '../components/JobCard';
import PostCard from '../components/PostCard';
import PostComposer from '../components/PostComposer';
import WaffleParty from '../components/WaffleParty';
import AsciiArt from '../components/AsciiArt';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Comeback() {
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'reintegrated'
  const [jobs, setJobs] = useState([]);
  const [hiredPosts, setHiredPosts] = useState([]);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showHiredComposer, setShowHiredComposer] = useState(false);
  const [showWaffle, setShowWaffle] = useState(false);
  const [loading, setLoading] = useState(true);

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
      const allPosts = postRes.data.posts || [];
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
    setShowWaffle(true); // Launch Waffle Party celebration!
  };

  return (
    <div className="space-y-4">
      {/* Header Art & Intro */}
      <Card className="p-4 flex flex-col items-center text-center space-y-2 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
        <AsciiArt piece="sunrise-horizon" size={12} still={true} tone="muted" />
        <h1 className="font-mono text-sm uppercase font-bold tracking-widest text-[var(--color-text-primary)]">
          THE COMEBACK
        </h1>
        <p className="text-xs text-[var(--color-text-muted)]">
          Job opportunities and reintegration celebrations for severed personnel.
        </p>
      </Card>

      {showWaffle && <WaffleParty onContinue={() => setShowWaffle(false)} />}

      {/* Tabs Switcher with Adaptive Buttons and Badges */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2 font-mono text-xs">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={activeTab === 'jobs' ? 'secondary' : 'ghost'}
            size="xs"
            onClick={() => setActiveTab('jobs')}
            className={`font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 ${
              activeTab === 'jobs' ? 'font-bold text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            JOBS
            <Badge variant="outline" size="sm" className="font-mono text-[10px]">
              {jobs.length}
            </Badge>
          </Button>

          <span className="text-[var(--color-border)]">|</span>

          <Button
            type="button"
            variant={activeTab === 'reintegrated' ? 'secondary' : 'ghost'}
            size="xs"
            onClick={() => setActiveTab('reintegrated')}
            className={`font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 ${
              activeTab === 'reintegrated' ? 'font-bold text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            REINTEGRATED
            <Badge variant="outline" size="sm" className="font-mono text-[10px]">
              {hiredPosts.length}
            </Badge>
          </Button>
        </div>

        {activeTab === 'jobs' ? (
          <Button
            type="button"
            variant="default"
            size="xs"
            onClick={() => setShowJobForm(!showJobForm)}
            className="uppercase font-semibold font-mono"
          >
            {showJobForm ? 'Close' : 'Post a Job'}
          </Button>
        ) : (
          <Button
            type="button"
            variant="default"
            size="xs"
            onClick={() => setShowHiredComposer(!showHiredComposer)}
            className="uppercase font-semibold font-mono"
          >
            {showHiredComposer ? 'Close' : 'I Got Hired'}
          </Button>
        )}
      </div>

      {/* Inline Job Creation Form */}
      {showJobForm && (
        <Card className="p-4 space-y-3 font-mono text-xs bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          <form onSubmit={handleJobSubmit} className="space-y-3">
            <h3 className="uppercase font-bold tracking-wider text-[var(--color-text-primary)]">Share an Open Position</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input required placeholder="Job Title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="text-xs font-mono" />
              <Input required placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} className="text-xs font-mono" />
              <Input placeholder="Location (e.g. Remote, NYC)" value={location} onChange={(e) => setLocation(e.target.value)} className="text-xs font-mono" />
              <Input required type="url" placeholder="Application URL" value={link} onChange={(e) => setLink(e.target.value)} className="text-xs font-mono" />
            </div>
            <Button type="submit" variant="default" size="sm" className="uppercase font-semibold font-mono">
              Publish Opportunity
            </Button>
          </form>
        </Card>
      )}

      {/* Inline Hired Post Composer */}
      {showHiredComposer && (
        <Card className="p-2 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          <PostComposer onPostCreated={handleHiredCreated} />
        </Card>
      )}

      {/* Content Lists */}
      {loading ? (
        <div className="font-mono text-xs text-[var(--color-text-muted)]">Loading...</div>
      ) : activeTab === 'jobs' ? (
        jobs.length === 0 ? (
          <Card
            className="p-8 text-center font-mono text-xs flex flex-col items-center justify-center space-y-3 text-[var(--color-text-muted)] bg-[var(--color-bg-card)] border border-[var(--color-border)]"
          >
            <AsciiArt piece="empty-no-results" size={12} still={true} tone="muted" />
            <p className="text-sm">No open jobs posted yet. Share one to help the severed.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {jobs.map((j) => (
              <JobCard key={j._id} job={j} />
            ))}
          </div>
        )
      ) : (
        hiredPosts.length === 0 ? (
          <Card
            className="p-8 text-center font-mono text-xs flex flex-col items-center justify-center space-y-3 text-[var(--color-text-muted)] bg-[var(--color-bg-card)] border border-[var(--color-border)]"
          >
            <AsciiArt piece="empty-no-results" size={12} still={true} tone="muted" />
            <p className="text-sm">No reintegration stories yet. Recovery awaits.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {hiredPosts.map((p) => (
              <PostCard key={p._id} post={p} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
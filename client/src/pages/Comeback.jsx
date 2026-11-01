import { useState, useEffect } from 'react';
import api from '../api/api';
import JobCard from '../components/JobCard';
import PostCard from '../components/PostCard';
import PostComposer from '../components/PostComposer';
import WaffleParty from '../components/WaffleParty';

// Comeback page: Jobs and Reintegrated recovery celebrations
export default function Comeback() {
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'reintegrated'
  const [jobs, setJobs] = useState([]);
  const [hiredPosts, setHiredPosts] = useState([]);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showHiredComposer, setShowHiredComposer] = useState(false);
  const [showWaffle, setShowWaffle] = useState(false);
  const [loading, setLoading] = useState(true);

  // Job form state
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [link, setLink] = useState('');

  // Load jobs and hired posts
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

  // Submit new job
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

  // Called when a hired post is created
  const handleHiredCreated = (post) => {
    setShowHiredComposer(false);
    setHiredPosts((prev) => [post, ...prev]);
    setShowWaffle(true); // Launch Waffle Party celebration!
  };

  return (
    <div className="space-y-4">
      {showWaffle && <WaffleParty onContinue={() => setShowWaffle(false)} />}

      {/* Tabs Switcher */}
      <div className="flex items-center justify-between border-b pb-2 font-mono text-xs" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('jobs')}
            className={`border-none bg-transparent uppercase tracking-wider ${activeTab === 'jobs' ? 'font-bold underline' : 'hover:opacity-75'}`}
            style={{ color: activeTab === 'jobs' ? 'var(--text)' : 'var(--muted)' }}
          >
            JOBS ({jobs.length})
          </button>
          <span style={{ color: 'var(--border)' }}>|</span>
          <button
            type="button"
            onClick={() => setActiveTab('reintegrated')}
            className={`border-none bg-transparent uppercase tracking-wider ${activeTab === 'reintegrated' ? 'font-bold underline' : 'hover:opacity-75'}`}
            style={{ color: activeTab === 'reintegrated' ? 'var(--text)' : 'var(--muted)' }}
          >
            REINTEGRATED ({hiredPosts.length})
          </button>
        </div>

        {activeTab === 'jobs' ? (
          <button
            type="button"
            onClick={() => setShowJobForm(!showJobForm)}
            className="px-3 py-1 uppercase font-semibold border"
            style={{ backgroundColor: 'var(--text)', color: 'var(--bg)', borderColor: 'var(--text)' }}
          >
            {showJobForm ? 'Close' : 'Post a Job'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowHiredComposer(!showHiredComposer)}
            className="px-3 py-1 uppercase font-semibold border"
            style={{ backgroundColor: 'var(--text)', color: 'var(--bg)', borderColor: 'var(--text)' }}
          >
            {showHiredComposer ? 'Close' : 'I Got Hired'}
          </button>
        )}
      </div>

      {/* Inline Job Creation Form */}
      {showJobForm && (
        <form onSubmit={handleJobSubmit} className="p-4 border space-y-3 font-mono text-xs" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h3 className="uppercase font-bold tracking-wider">Share an Open Position</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input required placeholder="Job Title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="p-2 border outline-none bg-transparent" style={{ borderColor: 'var(--border)', color: 'var(--text)' }} />
            <input required placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} className="p-2 border outline-none bg-transparent" style={{ borderColor: 'var(--border)', color: 'var(--text)' }} />
            <input placeholder="Location (e.g. Remote, NYC)" value={location} onChange={(e) => setLocation(e.target.value)} className="p-2 border outline-none bg-transparent" style={{ borderColor: 'var(--border)', color: 'var(--text)' }} />
            <input required type="url" placeholder="Application URL" value={link} onChange={(e) => setLink(e.target.value)} className="p-2 border outline-none bg-transparent" style={{ borderColor: 'var(--border)', color: 'var(--text)' }} />
          </div>
          <button type="submit" className="px-4 py-1.5 uppercase font-semibold" style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}>
            Publish Opportunity
          </button>
        </form>
      )}

      {/* Inline Hired Post Composer */}
      {showHiredComposer && (
        <div className="border p-2" style={{ borderColor: 'var(--border)' }}>
          <PostComposer onPostCreated={handleHiredCreated} />
        </div>
      )}

      {/* Content Lists */}
      {loading ? (
        <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Loading...</div>
      ) : activeTab === 'jobs' ? (
        jobs.length === 0 ? (
          <div className="p-8 text-center border font-mono text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
            No open jobs posted yet. Share one to help the severed.
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((j) => (
              <JobCard key={j._id} job={j} />
            ))}
          </div>
        )
      ) : (
        hiredPosts.length === 0 ? (
          <div className="p-8 text-center border font-mono text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
            No reintegration stories yet. Recovery awaits.
          </div>
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

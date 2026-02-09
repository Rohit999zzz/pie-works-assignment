import React, { useEffect, useState } from 'react';
import { fetchNudges, updateNudgeStatus, fetchJobs } from '../services/api';
import { useAuth } from '../context/AuthContext';
import NudgeCard from '../components/NudgeCard';
import { Sparkles, Briefcase } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const MEMBER_ID = user?.id;
  const [nudges, setNudges] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const nudgesData = await fetchNudges(MEMBER_ID);
        setNudges(nudgesData);

        if (nudgesData.length === 0) {
          const jobsData = await fetchJobs();
          setJobs(jobsData);
        }

      } catch (err) {
        console.error(err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    if (MEMBER_ID) {
      loadData();
    }
  }, [MEMBER_ID]);

  const handleAction = async (id, status) => {
    try {
      setNudges(prev => prev.map(n =>
        n.id === id ? { ...n, status } : n
      ));

      await updateNudgeStatus(id, status);
    } catch (err) {
      console.error('Action failed', err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
      {error}
    </div>
  );

  const pendingNudges = nudges.filter(n => n.status === 'pending');
  const historyNudges = nudges.filter(n => n.status !== 'pending');

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-indigo-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">
            {pendingNudges.length > 0 ? 'Your Referral Nudges' : 'Explore Opportunities'}
          </h1>
        </div>
        <p className="text-gray-600">
          {pendingNudges.length > 0
            ? `We've found ${pendingNudges.length} opportunities where your network could be a perfect match.`
            : "No specific matches yet, but here are some open roles you can refer for!"}
        </p>
      </div>

      {pendingNudges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {pendingNudges.map(nudge => (
            <NudgeCard
              key={nudge.id}
              nudge={nudge}
              onAction={handleAction}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {jobs.map(job => (
            <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{job.title}</h3>
                  <p className="text-indigo-600 font-medium text-sm">{job.company}</p>
                </div>
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{job.location}</span>
              </div>
              <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-2">{job.description}</p>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs text-gray-500">Exp: {job.min_experience}+ years</span>
                <button
                  onClick={() => alert(`Referral link for ${job.title} copied to clipboard! (Demo)`)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                >
                  Refer Someone
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {historyNudges.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-800 mb-6">History</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75 grayscale hover:grayscale-0 transition-all duration-500">
            {historyNudges.map(nudge => (
              <NudgeCard
                key={nudge.id}
                nudge={nudge}
                onAction={() => { }} // No action on history
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

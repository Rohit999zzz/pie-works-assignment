import React from 'react';
import { Briefcase, MapPin, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

const NudgeCard = ({ nudge, onAction }) => {
  const { job_title, job_company, job_location, score, reason, status, id } = nudge;

  const isPending = status === 'pending';

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{job_title}</h3>
          <p className="text-gray-500 font-medium">{job_company}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${score > 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
          Top Match {score}%
        </div>
      </div>

      <div className="flex items-center text-gray-500 text-sm mb-4">
        <MapPin size={16} className="mr-1" />
        {job_location}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
        <p className="text-blue-800 text-sm font-medium">Why you?</p>
        <p className="text-gray-700 text-sm mt-1">{reason}</p>
      </div>

      <div className="flex gap-3">
        {isPending ? (
          <>
            <button
              onClick={() => onAction(id, 'accepted')}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Refer Someone
            </button>
            <button
              onClick={() => onAction(id, 'ignored')}
              className="flex-1 bg-white text-gray-600 border border-gray-200 py-2 px-4 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <XCircle size={18} />
              Ignore
            </button>
          </>
        ) : (
          <div className="w-full text-center py-2 bg-gray-50 rounded-lg text-gray-500 font-medium">
            {status === 'accepted' ? 'Referral Initiated' : 'Nudge Ignored'}
          </div>
        )}
      </div>
    </div>
  );
};

export default NudgeCard;

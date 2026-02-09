import React, { useEffect, useState } from 'react';
import { fetchProfile, updateProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Briefcase, Award, Save, X } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const MEMBER_ID = user?.id;
  const [profile, setProfile] = useState(null);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    headline: '',
    location: '',
    company: '',
    experience: 0,
    skills: [] // Array of skill IDs
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchProfile(MEMBER_ID);
        setProfile(data.member);
        setAllSkills(data.allSkills);

        setFormData({
          name: data.member.name,
          headline: data.member.headline || '',
          location: data.member.location,
          company: data.member.current_company || '',
          experience: data.member.experience_years || 0,
          skills: data.member.skills ? data.member.skills.map(s => s.id) : []
        });
      } catch (err) {
        console.error(err);
        setMessage({ type: 'error', text: 'Failed to load profile.' });
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleSkill = (skillId) => {
    setFormData(prev => {
      const exists = prev.skills.includes(skillId);
      if (exists) {
        return { ...prev, skills: prev.skills.filter(id => id !== skillId) };
      } else {
        return { ...prev, skills: [...prev.skills, skillId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await updateProfile(MEMBER_ID, {
        ...formData,
        experience_years: parseInt(formData.experience),
        current_company: formData.company
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-10">Loading profile...</div>;

  const selectedSkillNames = allSkills
    .filter(s => formData.skills.includes(s.id))
    .map(s => s.name);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <User className="text-indigo-600" /> Edit Profile
      </h1>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
            <input
              type="text"
              name="headline"
              value={formData.headline}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <div className="relative">
              <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Company</label>
            <div className="relative">
              <Briefcase size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            min="0"
          />
        </div>

        {/* Skills Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Award size={18} /> Skills
          </label>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedSkillNames.map(name => (
                <span key={name} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                  {name}
                </span>
              ))}
              {selectedSkillNames.length === 0 && <span className="text-gray-500 text-sm">No skills selected</span>}
            </div>
            <div className="h-40 overflow-y-auto border-t border-gray-200 pt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {allSkills.map(skill => (
                  <label key={skill.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={formData.skills.includes(skill.id)}
                      onChange={() => toggleSkill(skill.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{skill.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;

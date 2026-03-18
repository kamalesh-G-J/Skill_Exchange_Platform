import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Avatar from '../components/Avatar';
import SkillTagInput from '../components/SkillTagInput';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    skillsOffered: [],
    skillsWanted: []
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/api/users/me');
        setUser(data);
        setFormData({
          name: data.name || '',
          bio: data.bio || '',
          skillsOffered: data.skillsOffered || [],
          skillsWanted: data.skillsWanted || []
        });
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setFormData({
      name: user?.name || '',
      bio: user?.bio || '',
      skillsOffered: user?.skillsOffered || [],
      skillsWanted: user?.skillsWanted || []
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/api/users/me', formData);
      setUser(data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      // Optimistic update
      setUser(prev => ({ ...prev, availabilityStatus: newStatus }));
      
      const { data } = await api.put('/api/users/me', { availabilityStatus: newStatus });
      setUser(data);
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status');
      // Revert optimism if failed
      setUser(prev => ({ ...prev, availabilityStatus: prev.availabilityStatus }));
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center text-gray-500">
        Could not load user profile.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 p-6 sm:p-10 border-b border-gray-100">
          <Avatar name={user.name} size="lg" availabilityStatus={user.availabilityStatus || 'available'} />
          
          <div className="flex-1 text-center sm:text-left w-full">
            {!isEditing ? (
              <>
                <h2 className="text-3xl font-bold text-gray-900">{user.name}</h2>
                <div className="flex items-center justify-center sm:justify-start mt-2 text-yellow-500">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="ml-1 text-gray-700 font-medium">
                    {user.rating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    ({user.totalReviews || 0} reviews)
                  </span>
                </div>
                <p className="mt-4 text-gray-600 max-w-2xl leading-relaxed">
                  {user.bio || 'No bio yet. Add one to let others know about you!'}
                </p>

                {/* Availability Toggles */}
                <div className="mt-6">
                  <span className="block text-sm font-medium text-gray-700 mb-2">Availability Status</span>
                  <div className="inline-flex rounded-md shadow-sm" role="group">
                    <button
                      type="button"
                      onClick={() => handleStatusChange('available')}
                      className={`px-4 py-2 text-sm font-medium border rounded-l-lg focus:z-10 focus:ring-2 focus:ring-blue-500 transition-colors ${
                        user.availabilityStatus === 'available' || !user.availabilityStatus
                          ? 'bg-[#1D9E75] text-white border-[#1D9E75]'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Available
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange('busy')}
                      className={`px-4 py-2 text-sm font-medium border-t border-b focus:z-10 focus:ring-2 focus:ring-blue-500 transition-colors ${
                        user.availabilityStatus === 'busy'
                          ? 'bg-[#BA7517] text-white border-[#BA7517]'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      Busy
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange('on_leave')}
                      className={`px-4 py-2 text-sm font-medium border rounded-r-lg focus:z-10 focus:ring-2 focus:ring-blue-500 transition-colors ${
                        user.availabilityStatus === 'on_leave'
                          ? 'bg-[#888780] text-white border-[#888780]'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      On Leave
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full space-y-4 text-left">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    id="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Tell others about your experience, learning goals, etc."
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:items-end w-full sm:w-auto mt-4 sm:mt-0">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex flex-row space-x-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Skills Section */}
        <div className="p-6 sm:p-10 bg-gray-50">
          <div className="max-w-3xl mx-auto space-y-8 text-left">
            {/* Skills Offered */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 border-b pb-2">Skills I Offer</h3>
              {isEditing ? (
                <SkillTagInput
                  label="Add skills you can teach"
                  tags={formData.skillsOffered}
                  onChange={(tags) => setFormData({ ...formData, skillsOffered: tags })}
                  type="offered"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user.skillsOffered && user.skillsOffered.length > 0 ? (
                    user.skillsOffered.map((skill, index) => {
                      const endorsementRecord = user.endorsements?.find(e => e.skill === skill);
                      const count = endorsementRecord?.endorsedBy?.length || 0;
                      return (
                        <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {skill}
                          {count > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-green-100 bg-green-700 rounded-full">
                              +{count}
                            </span>
                          )}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-gray-500 italic text-sm">No skills listed yet.</span>
                  )}
                </div>
              )}
            </div>

            {/* Skills Wanted */}
            <div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900 border-b pb-2">Skills I Want to Learn</h3>
              {isEditing ? (
                <SkillTagInput
                  label="Add skills you want to learn"
                  tags={formData.skillsWanted}
                  onChange={(tags) => setFormData({ ...formData, skillsWanted: tags })}
                  type="wanted"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user.skillsWanted && user.skillsWanted.length > 0 ? (
                    user.skillsWanted.map((skill, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 italic text-sm">No skills listed yet.</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Profile;

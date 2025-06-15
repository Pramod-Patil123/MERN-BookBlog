// src/components/Profile/ProfileDisplay.jsx
import PropTypes from 'prop-types';
import { format } from 'date-fns';

const ProfileDisplay = ({ userData }) => {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      {/* Account Section */}
      <section className="mb-8 border-b pb-6">
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">
          {userData.username}'s Profile
        </h2>
        <div className="space-y-2">
          <p className="text-slate-600">
            <span className="font-medium">Email:</span> {userData.email}
          </p>
          <p className="text-slate-600">
            <span className="font-medium">Member since:</span> 
            {format(new Date(userData.createdAt), ' dd MMM yyyy')}
          </p>
        </div>
      </section>

      {/* Preferences Section */}
      <section className="space-y-6">
        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-700 mb-3">
            Favorite Genres
          </h3>
          <div className="flex flex-wrap gap-2">
            {userData.preferences.genres.map((genre) => (
              <span 
                key={genre}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {genre}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-700 mb-3">
            Favorite Authors
          </h3>
          <div className="flex flex-wrap gap-2">
            {userData.preferences.favoriteAuthors.map((author) => (
              <span
                key={author}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
              >
                {author}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

ProfileDisplay.propTypes = {
  userData: PropTypes.shape({
    username: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    preferences: PropTypes.shape({
      genres: PropTypes.arrayOf(PropTypes.string).isRequired,
      favoriteAuthors: PropTypes.arrayOf(PropTypes.string).isRequired,
    }).isRequired,
  }).isRequired,
};

export default ProfileDisplay;

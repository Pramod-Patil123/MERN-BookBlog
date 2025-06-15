import React, { useState, useRef, useEffect } from 'react';
import './ProfileForm.css'; 

export default function ProfileForm() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: '',
    address: '',
    phone: '',
    genres: [],
    dob: '',
    username: '',
    firstName: '',
    lastName: '',
    favoriteAuthor: '',
    location: '',
  });

  const [isEditing, setIsEditing] = useState(true);
  const [formState, setFormState] = useState(profile);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);

  //  Token presence check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to access this page.');
      window.location.href = '/login'; 
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    if (name === 'email' || name === 'phone') validateField(name, value);
  };

  const handleSelectChange = (e) => {
    const { value } = e.target;
    setFormState((prev) => ({
      ...prev,
      genres: e.target.selectedOptions
        ? Array.from(e.target.selectedOptions, (option) => option.value)
        : [value],
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormState((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setFormState(profile);
    setIsEditing(true);
    setSuccessMessage('');
  };

  const handleCancel = () => {
    setFormState(profile);
    setIsEditing(false);
    setSuccessMessage('');
  };

  const handleSave = async () => {
    if (!isFormValid()) return;
    setIsLoading(true);
    setSuccessMessage('');
    try {
      await new Promise((res) => setTimeout(res, 1000)); 
      setProfile(formState);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 4000); 
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const validateField = (name, value) => {
    let errorMsg = '';
    if (name === 'email' && !/\S+@\S+\.\S+/.test(value)) {
      errorMsg = 'Please enter a valid email';
    }
    if (name === 'phone' && !/^\d{10}$/.test(value)) {
      errorMsg = 'Phone number should be 10 digits';
    }
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const isFormValid = () => {
    const newErrors = {};
    if (!/\S+@\S+\.\S+/.test(formState.email)) newErrors.email = 'Invalid email';
    if (!/^\d{10}$/.test(formState.phone)) newErrors.phone = 'Invalid phone number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="profile-form-container">
      <div className="profile-picture-section">
        <h3>Profile Picture</h3>
        <div className="avatar-upload">
          <label htmlFor="avatar">
            <div className="avatar-preview">
              {formState.avatar ? (
                <img src={formState.avatar} alt="Profile Avatar" />
              ) : (
                <div className="placeholder">
                  <span>Upload new image</span>
                </div>
              )}
            </div>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            id="avatar"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <p className="file-info">JPG or PNG no larger than 5 MB</p>
        </div>
      </div>

      <div className="account-details-section">
        <h3>Account Details</h3>
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}
        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-2 gap-x-6 gap-y-4">
          {/* Username */}
          <div>
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              disabled={!isEditing}
              value={formState.username}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div />

          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="form-label">First name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              disabled={!isEditing}
              value={formState.firstName}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="form-label">Last name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              disabled={!isEditing}
              value={formState.lastName}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* Favorite Author */}
          <div>
            <label htmlFor="favoriteAuthor" className="form-label">Favorite Author</label>
            <input
              type="text"
              id="favoriteAuthor"
              name="favoriteAuthor"
              disabled={!isEditing}
              value={formState.favoriteAuthor}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="form-label">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              disabled={!isEditing}
              value={formState.location}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* Email Address */}
          <div className="col-span-2">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              type="email"
              id="email"
              name="email"
              disabled={!isEditing}
              value={formState.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="form-label">Phone number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              disabled={!isEditing}
              value={formState.phone}
              onChange={handleChange}
              className={`form-input ${errors.phone ? 'error' : ''}`}
            />
            {errors.phone && <p className="error-message">{errors.phone}</p>}
          </div>

          {/* Birthday */}
          <div>
            <label htmlFor="dob" className="form-label">Birthday</label>
            <input
              type="date"
              id="dob"
              name="dob"
              disabled={!isEditing}
              value={formState.dob}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* Bio */}
          <div className="col-span-2">
            <label htmlFor="bio" className="form-label">Bio</label>
            <textarea
              id="bio"
              name="bio"
              disabled={!isEditing}
              value={formState.bio}
              onChange={handleChange}
              rows={3}
              className="form-input"
            />
          </div>

          {/* Address */}
          <div className="col-span-2">
            <label htmlFor="address" className="form-label">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              disabled={!isEditing}
              value={formState.address}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* Genres */}
          <div className="col-span-2">
            <label htmlFor="genres" className="form-label">Preferred Genres</label>
            <select
              id="genres"
              name="genres"
              multiple
              disabled={!isEditing}
              value={formState.genres}
              onChange={handleSelectChange}
              className="form-input"
            >
              <option value="fiction">Fiction</option>
              <option value="non-fiction">Non-fiction</option>
              <option value="fantasy">Fantasy</option>
              <option value="mystery">Mystery</option>
              <option value="romance">Romance</option>
            </select>
            <div className="selected-genres">
              <span>Selected Genres:</span>{' '}
              {formState.genres.length ? formState.genres.join(', ') : 'None selected'}
            </div>
          </div>

          {/* Buttons */}
          <div className="col-span-2 flex justify-end space-x-4 mt-6">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isLoading}
                  className="save-button button"
                >
                  {isLoading ? 'Saving...' : 'Save changes'}
                </button>
                <button type="button" onClick={handleCancel} className="cancel-button button">
                  Cancel
                </button>
              </>
            ) : (
              <button type="button" onClick={handleEdit} className="edit-button button">
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

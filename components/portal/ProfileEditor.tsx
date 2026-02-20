'use client'

import { useState, useEffect, useRef } from 'react';
import { Save, Upload, Plus, Trash2, Loader2 } from 'lucide-react';
import {
  getTeacherProfile,
  updateTeacherProfileById,
  uploadTeacherPhoto,
  DEFAULT_PROFILE,
  type ScheduleSlot,
} from '@/lib/teacherProfile';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ProfileEditor() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  const [name, setName] = useState(DEFAULT_PROFILE.name);
  const [tagline, setTagline] = useState(DEFAULT_PROFILE.tagline);
  const [bio, setBio] = useState(DEFAULT_PROFILE.bio);
  const [philosophy, setPhilosophy] = useState(DEFAULT_PROFILE.philosophy);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>(DEFAULT_PROFILE.schedule);

  useEffect(() => {
    getTeacherProfile().then((profile) => {
      if (profile) {
        setProfileId(profile.id);
        setName(profile.name);
        setTagline(profile.tagline);
        setBio(profile.bio);
        setPhilosophy(profile.philosophy);
        setPhotoUrl(profile.photoUrl);
        setSchedule(profile.schedule);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!profileId) return;
    setSaving(true);
    setSaved(false);

    await updateTeacherProfileById(profileId, {
      name,
      tagline,
      bio,
      philosophy,
      photoUrl,
      schedule,
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profileId) return;

    setSaving(true);
    const url = await uploadTeacherPhoto(profileId, file);
    if (url) {
      setPhotoUrl(url);
    }
    setSaving(false);
  };

  const addScheduleSlot = () => {
    setSchedule([
      ...schedule,
      {
        id: crypto.randomUUID(),
        day: 'Monday',
        startTime: '8:00 AM',
        endTime: '3:00 PM',
        label: '',
      },
    ]);
  };

  const updateSlot = (id: string, updates: Partial<ScheduleSlot>) => {
    setSchedule(schedule.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const removeSlot = (id: string) => {
    setSchedule(schedule.filter((s) => s.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Public Profile</h2>
        <button
          onClick={handleSave}
          disabled={saving || !profileId}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {!profileId && (
        <div className="flex flex-col items-start gap-3 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 px-4 py-4 rounded-lg text-sm">
          <p className="font-medium">No profile found in the database.</p>
          <button
            onClick={async () => {
              setSaving(true);
              const { upsertTeacherProfile, DEFAULT_PROFILE } = await import('@/lib/teacherProfile');
              const newProfile = await upsertTeacherProfile('shanie-default-id', DEFAULT_PROFILE);
              if (newProfile) {
                setProfileId(newProfile.id);
                setName(newProfile.name);
                setTagline(newProfile.tagline);
                setBio(newProfile.bio);
                setPhilosophy(newProfile.philosophy);
                setPhotoUrl(newProfile.photoUrl);
                setSchedule(newProfile.schedule);
              }
              setSaving(false);
            }}
            disabled={saving}
            className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-amber-950 rounded-md font-semibold hover:bg-amber-400 transition-colors"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Initialize Default Profile
          </button>
        </div>
      )}

      {/* Profile Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Profile Photo</label>
        <div className="flex items-center gap-4">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt="Profile"
              className="w-24 h-24 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
            />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 text-2xl font-bold">
              {name.charAt(0)}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload Photo
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tagline</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Bio & Philosophy */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">About Me</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Teaching Philosophy</label>
          <textarea
            value={philosophy}
            onChange={(e) => setPhilosophy(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          />
        </div>
      </div>

      {/* Schedule */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Schedule</label>
          <button
            onClick={addScheduleSlot}
            className="flex items-center gap-1 text-sm text-indigo-400 hover:underline"
          >
            <Plus className="h-4 w-4" />
            Add Slot
          </button>
        </div>

        <div className="space-y-3">
          {schedule.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <select
                value={slot.day}
                onChange={(e) => updateSlot(slot.id, { day: e.target.value })}
                className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <input
                type="text"
                value={slot.startTime}
                onChange={(e) => updateSlot(slot.id, { startTime: e.target.value })}
                placeholder="Start"
                className="w-24 px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
              />
              <span className="text-gray-400">–</span>
              <input
                type="text"
                value={slot.endTime}
                onChange={(e) => updateSlot(slot.id, { endTime: e.target.value })}
                placeholder="End"
                className="w-24 px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
              />
              <input
                type="text"
                value={slot.label}
                onChange={(e) => updateSlot(slot.id, { label: e.target.value })}
                placeholder="Label"
                className="flex-1 px-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => removeSlot(slot.id)}
                className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

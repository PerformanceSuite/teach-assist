'use client'

import ProfileEditor from '@/components/portal/ProfileEditor';

export default function ProfilePage() {
  return (
    <div className="h-full overflow-auto p-6 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto">
        <ProfileEditor />
      </div>
    </div>
  );
}

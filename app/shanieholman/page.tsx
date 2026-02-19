'use client'

import { useEffect, useState } from 'react';
import HeroNav from '@/components/portal/HeroNav';
import AboutSection from '@/components/portal/AboutSection';
import ScheduleSection from '@/components/portal/ScheduleSection';
import ContactForm from '@/components/portal/ContactForm';
import GetToKnowMe from '@/components/portal/GetToKnowMe';
import { getTeacherProfile, DEFAULT_PROFILE, type TeacherProfile } from '@/lib/teacherProfile';

export default function MeetTheTeacher() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getTeacherProfile().then((p) => {
      setProfile(p);
      setLoaded(true);
    });
  }, []);

  const display = profile || {
    ...DEFAULT_PROFILE,
    id: '',
    createdAt: '',
    updatedAt: '',
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-cc-bg flex items-center justify-center">
        <div className="text-cc-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cc-bg">
      <HeroNav teacherName={display.name} />

      <div className="pt-14" />

      <AboutSection
        photoUrl={display.photoUrl}
        name={display.name}
        tagline={display.tagline}
        bio={display.bio}
        philosophy={display.philosophy}
      />

      <ScheduleSection schedule={display.schedule} />

      <ContactForm teacherId={profile?.id || null} />

      <GetToKnowMe />

      <footer className="py-8 text-center text-cc-muted text-sm border-t border-cc-border/50">
        <p>&copy; {new Date().getFullYear()} {display.name}</p>
      </footer>
    </div>
  );
}

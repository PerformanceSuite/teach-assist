'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, X, Users } from 'lucide-react';
import { useStudentsStore, useStudentCount } from '@/stores/studentsStore';

export default function StudentSelector() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const students = useStudentsStore((state) => state.students);
  const selectedStudentIds = useStudentsStore((state) => state.selectedStudentIds);
  const selectStudents = useStudentsStore((state) => state.selectStudents);
  const studentCount = useStudentCount();
  const hasStudents = studentCount > 0;

  const toggleStudentSelection = (id: string) => {
    const isSelected = selectedStudentIds.includes(id);
    if (isSelected) {
      selectStudents(selectedStudentIds.filter((sid) => sid !== id));
    } else {
      selectStudents([...selectedStudentIds, id]);
    }
  };
  const selectedStudents = students.filter((s) => selectedStudentIds.includes(s.id));

  const handleRemoveStudent = (studentId: string) => {
    selectStudents(selectedStudentIds.filter((id) => id !== studentId));
  };

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-neutral-500" />
          <span>Personalize for students</span>
          {selectedStudents.length > 0 && (
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded-full">
              {selectedStudents.length}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-neutral-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-neutral-500" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          {!hasStudents ? (
            <div className="text-sm text-neutral-500 dark:text-neutral-400 py-2">
              <Link
                href="/students"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Add students to personalize responses
              </Link>
            </div>
          ) : (
            <>
              {/* Multi-select Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  <span>
                    {selectedStudents.length === 0
                      ? 'Select students...'
                      : `${selectedStudents.length} student${selectedStudents.length > 1 ? 's' : ''} selected`}
                  </span>
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {students.map((student) => {
                      const isSelected = selectedStudentIds.includes(student.id);
                      return (
                        <button
                          key={student.id}
                          onClick={() => toggleStudentSelection(student.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors ${
                            isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-600 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-neutral-700 dark:text-neutral-300">
                            {student.name}
                          </span>
                          {student.interests.length > 0 && (
                            <span className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                              ({student.interests.slice(0, 2).join(', ')})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected Students Chips */}
              {selectedStudents.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedStudents.map((student) => (
                    <span
                      key={student.id}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full"
                    >
                      {student.name}
                      <button
                        onClick={() => handleRemoveStudent(student.id)}
                        className="hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
                        aria-label={`Remove ${student.name}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

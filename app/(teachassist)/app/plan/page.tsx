'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  Copy,
  Check,
  Trash2,
  ChevronDown,
  Loader2,
  AlertCircle,
  X,
  Users
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { usePlanningStore } from '@/stores/planningStore';
import { useStudentsStore } from '@/stores/studentsStore';
import type { UnitCreate, UnitResponse, LessonCreate, LessonResponse } from '@/lib/api';

type TabType = 'unit' | 'lesson';

const SUBJECTS = [
  'Science',
  'Mathematics',
  'English Language Arts',
  'Social Studies',
  'World Languages',
  'Arts',
  'Physical Education',
  'Technology',
  'Other'
];

const DURATIONS = [30, 45, 50, 60, 90];
const FORMATS = [
  { value: 'minimum_viable', label: 'Minimum Viable' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'stretch', label: 'Stretch' },
] as const;

export default function PlanStudioPage() {
  const [activeTab, setActiveTab] = useState<TabType>('unit');
  const [copied, setCopied] = useState(false);

  // Unit Form State
  const [unitForm, setUnitForm] = useState({
    title: '',
    subject: '',
    grade: 6,
    duration_weeks: 3,
    standards: '',
  });
  const [unitResult, setUnitResult] = useState<UnitResponse | null>(null);

  // Lesson Form State
  const [lessonForm, setLessonForm] = useState({
    unit_id: '',
    topic: '',
    duration_minutes: 50,
    format: 'detailed' as 'minimum_viable' | 'detailed' | 'stretch',
  });
  const [lessonResult, setLessonResult] = useState<LessonResponse | null>(null);

  // Store state
  const {
    units,
    isLoading,
    error,
    fetchUnits,
    createUnit,
    deleteUnit,
    createLesson,
    clearError
  } = usePlanningStore();

  const {
    students,
    selectedStudentIds,
    selectStudents,
    fetchStudents
  } = useStudentsStore();

  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchUnits();
    fetchStudents();
  }, [fetchUnits, fetchStudents]);

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleGenerateUnit = async () => {
    if (!unitForm.title.trim() || !unitForm.subject) return;

    const standardsList = unitForm.standards
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const data: UnitCreate = {
      title: unitForm.title,
      subject: unitForm.subject,
      grade: unitForm.grade,
      duration_weeks: unitForm.duration_weeks,
      standards: standardsList,
    };

    const result = await createUnit(data);
    if (result.success && result.data) {
      setUnitResult(result.data);
    }
  };

  const handleGenerateLesson = async () => {
    if (!lessonForm.topic.trim()) return;

    const data: LessonCreate = {
      topic: lessonForm.topic,
      duration_minutes: lessonForm.duration_minutes,
      format: lessonForm.format,
      unit_id: lessonForm.unit_id || undefined,
      student_ids: selectedStudentIds.length > 0 ? selectedStudentIds : undefined,
    };

    const result = await createLesson(data);
    if (result.success && result.data) {
      setLessonResult(result.data);
    }
  };

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleStudentSelection = (id: string) => {
    const isSelected = selectedStudentIds.includes(id);
    if (isSelected) {
      selectStudents(selectedStudentIds.filter(sid => sid !== id));
    } else {
      selectStudents([...selectedStudentIds, id]);
    }
  };

  const formatUnitAsMarkdown = (unit: UnitResponse): string => {
    let md = `# ${unit.title}\n\n`;

    md += `## Transfer Goals\n`;
    unit.transfer_goals.forEach(goal => {
      md += `- ${goal}\n`;
    });

    md += `\n## Essential Questions\n`;
    unit.essential_questions.forEach(q => {
      md += `- ${q}\n`;
    });

    md += `\n## Performance Task (GRASPS)\n`;
    const grasps = unit.performance_task.grasps;
    md += `**Goal:** ${grasps.goal}\n\n`;
    md += `**Role:** ${grasps.role}\n\n`;
    md += `**Audience:** ${grasps.audience}\n\n`;
    md += `**Situation:** ${grasps.situation}\n\n`;
    md += `**Product:** ${grasps.product}\n\n`;
    md += `**Standards:** ${grasps.standards}\n\n`;

    md += `## Lesson Sequence\n`;
    unit.lesson_sequence.forEach(lesson => {
      md += `\n### Lesson ${lesson.lesson}: ${lesson.title}\n`;
      md += `*Type: ${lesson.type}*\n\n`;
      lesson.activities.forEach(activity => {
        md += `- ${activity}\n`;
      });
    });

    return md;
  };

  const formatLessonAsMarkdown = (lesson: LessonResponse): string => {
    let md = `# ${lesson.title}\n\n`;
    md += `**Learning Target:** ${lesson.learning_target}\n\n`;
    md += `**Format:** ${lesson.format}\n\n`;

    md += `## Lesson Plan\n\n`;

    const sections = [
      { name: 'Opening', data: lesson.plan.opening },
      { name: 'Instruction', data: lesson.plan.instruction },
      { name: 'Practice', data: lesson.plan.practice },
      { name: 'Closing', data: lesson.plan.closing },
    ];

    sections.forEach(({ name, data }) => {
      md += `### ${name} (${data.duration} min)\n`;
      md += `${data.activity}\n\n`;
      if (data.key_points && data.key_points.length > 0) {
        md += `**Key Points:**\n`;
        data.key_points.forEach(point => {
          md += `- ${point}\n`;
        });
        md += '\n';
      }
    });

    md += `## Materials\n`;
    lesson.materials.forEach(mat => {
      md += `- ${mat}\n`;
    });

    if (lesson.differentiation_notes) {
      md += `\n## Differentiation Notes\n`;
      md += lesson.differentiation_notes + '\n';
    }

    return md;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Plan Studio</h1>
        <p className="text-neutral-700">
          UbD-guided unit and lesson planning with AI assistance
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button onClick={clearError} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-neutral-200">
            <button
              onClick={() => setActiveTab('unit')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'unit'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-neutral-600 hover:border-neutral-300'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Unit Planner
            </button>
            <button
              onClick={() => setActiveTab('lesson')}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'lesson'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-neutral-600 hover:border-neutral-300'
              }`}
            >
              <FileText className="h-4 w-4" />
              Lesson Planner
            </button>
          </div>

          {/* Unit Planner Tab */}
          {activeTab === 'unit' && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-white p-4 shadow-sm space-y-4">
                <h2 className="font-semibold text-lg">Create Unit Plan</h2>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Unit Title
                  </label>
                  <input
                    type="text"
                    value={unitForm.title}
                    onChange={(e) => setUnitForm({ ...unitForm, title: e.target.value })}
                    placeholder="e.g., Forces and Motion"
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Subject & Grade Row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Subject
                    </label>
                    <select
                      value={unitForm.subject}
                      onChange={(e) => setUnitForm({ ...unitForm, subject: e.target.value })}
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Select subject...</option>
                      {SUBJECTS.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Grade Level
                    </label>
                    <select
                      value={unitForm.grade}
                      onChange={(e) => setUnitForm({ ...unitForm, grade: parseInt(e.target.value) })}
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
                        <option key={grade} value={grade}>Grade {grade}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Duration (weeks)
                  </label>
                  <select
                    value={unitForm.duration_weeks}
                    onChange={(e) => setUnitForm({ ...unitForm, duration_weeks: parseInt(e.target.value) })}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    {Array.from({ length: 8 }, (_, i) => i + 1).map(weeks => (
                      <option key={weeks} value={weeks}>{weeks} week{weeks > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                {/* Standards */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Standards (one per line)
                  </label>
                  <textarea
                    value={unitForm.standards}
                    onChange={(e) => setUnitForm({ ...unitForm, standards: e.target.value })}
                    placeholder="NGSS MS-PS2-1: Apply Newton's Third Law&#10;NGSS MS-PS2-2: Plan an investigation"
                    rows={4}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateUnit}
                  disabled={isLoading || !unitForm.title.trim() || !unitForm.subject}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Unit Plan'
                  )}
                </button>
              </div>

              {/* Unit Result */}
              {unitResult && (
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Generated Unit Plan</h3>
                    <button
                      onClick={() => handleCopy(formatUnitAsMarkdown(unitResult))}
                      className="flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{formatUnitAsMarkdown(unitResult)}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Lesson Planner Tab */}
          {activeTab === 'lesson' && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-white p-4 shadow-sm space-y-4">
                <h2 className="font-semibold text-lg">Create Lesson Plan</h2>

                {/* Unit Selection (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Unit (optional)
                  </label>
                  <select
                    value={lessonForm.unit_id}
                    onChange={(e) => setLessonForm({ ...lessonForm, unit_id: e.target.value })}
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Standalone lesson...</option>
                    {units.map(unit => (
                      <option key={unit.unit_id} value={unit.unit_id}>{unit.title}</option>
                    ))}
                  </select>
                </div>

                {/* Topic */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Lesson Topic
                  </label>
                  <input
                    type="text"
                    value={lessonForm.topic}
                    onChange={(e) => setLessonForm({ ...lessonForm, topic: e.target.value })}
                    placeholder="e.g., Introduction to Newton's First Law"
                    className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Duration & Format Row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Duration
                    </label>
                    <select
                      value={lessonForm.duration_minutes}
                      onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: parseInt(e.target.value) })}
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      {DURATIONS.map(dur => (
                        <option key={dur} value={dur}>{dur} minutes</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Format
                    </label>
                    <select
                      value={lessonForm.format}
                      onChange={(e) => setLessonForm({ ...lessonForm, format: e.target.value as any })}
                      className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      {FORMATS.map(fmt => (
                        <option key={fmt.value} value={fmt.value}>{fmt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Student Selector */}
                <div className="border border-neutral-200 rounded-lg">
                  <button
                    onClick={() => setIsStudentDropdownOpen(!isStudentDropdownOpen)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-neutral-500" />
                      <span>Personalize for students</span>
                      {selectedStudentIds.length > 0 && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                          {selectedStudentIds.length}
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${isStudentDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isStudentDropdownOpen && (
                    <div className="px-3 pb-3 space-y-2">
                      {students.length === 0 ? (
                        <div className="text-sm text-neutral-500 py-2">
                          <a href="/students" className="text-blue-600 hover:underline">
                            Add students to personalize responses
                          </a>
                        </div>
                      ) : (
                        <>
                          <div className="max-h-48 overflow-y-auto border border-neutral-200 rounded-md">
                            {students.map((student) => {
                              const isSelected = selectedStudentIds.includes(student.id);
                              return (
                                <button
                                  key={student.id}
                                  onClick={() => toggleStudentSelection(student.id)}
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-neutral-100 transition-colors ${
                                    isSelected ? 'bg-blue-50' : ''
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="w-4 h-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-neutral-700">{student.name}</span>
                                  {student.interests.length > 0 && (
                                    <span className="text-xs text-neutral-400 truncate">
                                      ({student.interests.slice(0, 2).join(', ')})
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Selected Students Chips */}
                          {selectedStudentIds.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {students
                                .filter(s => selectedStudentIds.includes(s.id))
                                .map((student) => (
                                  <span
                                    key={student.id}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                                  >
                                    {student.name}
                                    <button
                                      onClick={() => toggleStudentSelection(student.id)}
                                      className="hover:text-blue-900 transition-colors"
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

                {/* Generate Button */}
                <button
                  onClick={handleGenerateLesson}
                  disabled={isLoading || !lessonForm.topic.trim()}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Lesson'
                  )}
                </button>
              </div>

              {/* Lesson Result */}
              {lessonResult && (
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">Generated Lesson Plan</h3>
                    <button
                      onClick={() => handleCopy(formatLessonAsMarkdown(lessonResult))}
                      className="flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  {/* Prominent Differentiation Notes */}
                  {lessonResult.differentiation_notes && selectedStudentIds.length > 0 && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-2 text-amber-800 font-medium mb-1">
                        <Users className="h-4 w-4" />
                        Differentiation Notes
                      </div>
                      <p className="text-sm text-amber-700">{lessonResult.differentiation_notes}</p>
                    </div>
                  )}

                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{formatLessonAsMarkdown(lessonResult)}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="font-semibold text-lg mb-3">Saved Unit Plans</h3>

            {units.length === 0 ? (
              <p className="text-sm text-neutral-500">
                No unit plans yet. Create one to get started.
              </p>
            ) : (
              <div className="space-y-2">
                {units.map((unit) => (
                  <div
                    key={unit.unit_id}
                    className="group flex items-center justify-between p-3 rounded-md border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
                  >
                    <button
                      onClick={() => {
                        setUnitResult(unit);
                        setActiveTab('unit');
                      }}
                      className="flex-1 text-left"
                    >
                      <div className="font-medium text-sm text-neutral-900">
                        {unit.title}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {unit.lesson_sequence.length} lessons
                      </div>
                    </button>
                    <button
                      onClick={() => deleteUnit(unit.unit_id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-600 transition-all"
                      title="Delete unit"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Tips */}
          <div className="rounded-lg border bg-blue-50 p-4">
            <h4 className="font-medium text-blue-900 mb-2">UbD Planning Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>- Start with transfer goals (Stage 1)</li>
              <li>- Design assessments before lessons (Stage 2)</li>
              <li>- Use GRASPS for performance tasks</li>
              <li>- Align all activities to standards</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client'

import { useState, useMemo } from 'react'
import { useNarrativesStore } from '@/stores/narrativesStore'
import type { StudentData, CriteriaScores } from '@/lib/api'
import {
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Users,
  Upload,
  X,
  Edit2,
  Check,
} from 'lucide-react'

const DEFAULT_CRITERIA_LABELS: Record<string, string> = {
  A_knowing: 'A: Knowing',
  B_inquiring: 'B: Inquiring',
  C_processing: 'C: Processing',
  D_reflecting: 'D: Reflecting',
}

const TREND_OPTIONS = [
  { value: '', label: 'Select trend...' },
  { value: 'improving', label: 'Improving' },
  { value: 'consistent', label: 'Consistent' },
  { value: 'declining', label: 'Declining' },
]

interface StudentFormState {
  initials: string
  criteriaScores: Record<string, number>
  observations: string
  formative_trend: string
  notable_work: string
}

export function StudentDataStep() {
  const { students, addStudent, updateStudent, removeStudent, clearStudents, nextStep, prevStep, rubricCriteria, selectedRubricTemplate } =
    useNarrativesStore()

  // Derive criteria labels from rubric template or fallback to defaults
  const criteriaLabels = useMemo(() => {
    if (selectedRubricTemplate && selectedRubricTemplate.criteria.length > 0) {
      const labels: Record<string, string> = {}
      selectedRubricTemplate.criteria.forEach(c => {
        labels[c.id] = `${c.id.split('_')[0].toUpperCase()}: ${c.name.split(' ')[0]}`
      })
      return labels
    }
    if (rubricCriteria.length > 0) {
      const labels: Record<string, string> = {}
      rubricCriteria.forEach(c => {
        labels[c.id] = `${c.id.split('_')[0].toUpperCase()}: ${c.name.split(' ')[0]}`
      })
      return labels
    }
    return DEFAULT_CRITERIA_LABELS
  }, [selectedRubricTemplate, rubricCriteria])

  const criteriaKeys = Object.keys(criteriaLabels)

  const makeEmptyForm = (): StudentFormState => ({
    initials: '',
    criteriaScores: Object.fromEntries(criteriaKeys.map(k => [k, 5])),
    observations: '',
    formative_trend: '',
    notable_work: '',
  })

  const [form, setForm] = useState<StudentFormState>(makeEmptyForm)
  const [editingInitials, setEditingInitials] = useState<string | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)

  const handleFormChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleScoreChange = (criterionId: string, value: number) => {
    setForm((prev) => ({
      ...prev,
      criteriaScores: { ...prev.criteriaScores, [criterionId]: value },
    }))
  }

  const handleAddStudent = () => {
    if (!form.initials.trim()) return

    const criteriaScoresObj: CriteriaScores = {}
    for (const [key, val] of Object.entries(form.criteriaScores)) {
      (criteriaScoresObj as Record<string, number>)[key] = val
    }

    const studentData: StudentData = {
      initials: form.initials.toUpperCase().trim(),
      criteria_scores: criteriaScoresObj,
      observations: form.observations
        .split('\n')
        .map((o) => o.trim())
        .filter(Boolean),
      formative_trend: form.formative_trend as 'improving' | 'consistent' | 'declining' | undefined,
      notable_work: form.notable_work.trim() || undefined,
    }

    if (editingInitials) {
      removeStudent(editingInitials)
      addStudent(studentData)
      setEditingInitials(null)
    } else {
      addStudent(studentData)
    }

    setForm(makeEmptyForm())
  }

  const handleEditStudent = (student: StudentData) => {
    const scores: Record<string, number> = {}
    for (const key of criteriaKeys) {
      scores[key] = (student.criteria_scores as Record<string, number | undefined>)[key] || 5
    }
    setForm({
      initials: student.initials,
      criteriaScores: scores,
      observations: student.observations.join('\n'),
      formative_trend: student.formative_trend || '',
      notable_work: student.notable_work || '',
    })
    setEditingInitials(student.initials)
  }

  const handleCancelEdit = () => {
    setForm(makeEmptyForm())
    setEditingInitials(null)
  }

  const handleCSVImport = (csvText: string) => {
    const lines = csvText.trim().split('\n')
    if (lines.length < 2) return

    // Parse header
    const header = lines[0].toLowerCase().split(',').map((h) => h.trim())
    const initialsIdx = header.findIndex((h) => h.includes('initial'))
    const aIdx = header.findIndex((h) => h === 'a' || h.includes('knowing'))
    const bIdx = header.findIndex((h) => h === 'b' || h.includes('inquiring'))
    const cIdx = header.findIndex((h) => h === 'c' || h.includes('processing'))
    const dIdx = header.findIndex((h) => h === 'd' || h.includes('reflecting'))
    const trendIdx = header.findIndex((h) => h.includes('trend'))
    const notableIdx = header.findIndex((h) => h.includes('notable'))
    const obsIdx = header.findIndex((h) => h.includes('observation'))

    // Parse rows
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim())
      if (cols.length < 2) continue

      const studentData: StudentData = {
        initials: (initialsIdx >= 0 ? cols[initialsIdx] : cols[0]).toUpperCase(),
        criteria_scores: {
          A_knowing: aIdx >= 0 ? parseInt(cols[aIdx]) || 5 : 5,
          B_inquiring: bIdx >= 0 ? parseInt(cols[bIdx]) || 5 : 5,
          C_processing: cIdx >= 0 ? parseInt(cols[cIdx]) || 5 : 5,
          D_reflecting: dIdx >= 0 ? parseInt(cols[dIdx]) || 5 : 5,
        },
        observations: obsIdx >= 0 ? cols[obsIdx].split('|').map((o) => o.trim()).filter(Boolean) : [],
        formative_trend: trendIdx >= 0 ? (cols[trendIdx] as 'improving' | 'consistent' | 'declining') : undefined,
        notable_work: notableIdx >= 0 ? cols[notableIdx] : undefined,
      }

      if (studentData.initials) {
        addStudent(studentData)
      }
    }

    setShowImportModal(false)
  }

  const canProceed = students.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Student Data</h2>
          <p className="text-gray-400 text-sm">
            Add students with their IB criteria scores and observations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">{students.length} students</span>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
        </div>
      </div>

      {/* Quick Add Form */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {editingInitials ? `Edit ${editingInitials}` : 'Add Student'}
        </h3>

        <div className={`grid grid-cols-1 gap-4`} style={{ gridTemplateColumns: `repeat(${Math.min(criteriaKeys.length + 2, 6)}, minmax(0, 1fr))` }}>
          {/* Initials */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Initials</label>
            <input
              type="text"
              value={form.initials}
              onChange={(e) => handleFormChange('initials', e.target.value.slice(0, 5))}
              placeholder="AB"
              disabled={!!editingInitials}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          {/* Dynamic Criteria Scores */}
          {criteriaKeys.map((key) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                {criteriaLabels[key]}
              </label>
              <input
                type="number"
                min="1"
                max="8"
                value={form.criteriaScores[key] || 5}
                onChange={(e) => handleScoreChange(key, parseInt(e.target.value) || 1)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          {/* Trend */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Trend</label>
            <select
              value={form.formative_trend}
              onChange={(e) => handleFormChange('formative_trend', e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TREND_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Observations */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Observations (one per line)
          </label>
          <textarea
            value={form.observations}
            onChange={(e) => handleFormChange('observations', e.target.value)}
            placeholder="Strong understanding of lab procedures&#10;Struggles with written explanations&#10;Excellent collaboration skills"
            rows={3}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Notable Work */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Notable Work (optional)
          </label>
          <input
            type="text"
            value={form.notable_work}
            onChange={(e) => handleFormChange('notable_work', e.target.value)}
            placeholder="e.g., Science Fair soil erosion project"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Add Button */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleAddStudent}
            disabled={!form.initials.trim()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {editingInitials ? (
              <>
                <Check className="w-4 h-4" />
                Update Student
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Student
              </>
            )}
          </button>
          {editingInitials && (
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Student List */}
      {students.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Students ({students.length})
            </h3>
            <button
              onClick={clearStudents}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              Clear All
            </button>
          </div>

          <div className="bg-gray-800/30 rounded-lg border border-gray-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Initials</th>
                  {criteriaKeys.map(key => (
                    <th key={key} className="text-center py-2 px-2 text-gray-400 font-medium">
                      {key.split('_')[0].toUpperCase()}
                    </th>
                  ))}
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Trend</th>
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Observations</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.initials}
                    className="border-t border-gray-700 hover:bg-gray-800/50"
                  >
                    <td className="py-2 px-3 text-white font-medium">{student.initials}</td>
                    {criteriaKeys.map(key => (
                      <td key={key} className="text-center py-2 px-2 text-gray-300">
                        {(student.criteria_scores as Record<string, number | undefined>)[key] || '-'}
                      </td>
                    ))}
                    <td className="py-2 px-3 text-gray-300 capitalize">
                      {student.formative_trend || '-'}
                    </td>
                    <td className="py-2 px-3 text-gray-400 text-xs truncate max-w-[200px]">
                      {student.observations.length > 0
                        ? `${student.observations.length} observation${student.observations.length > 1 ? 's' : ''}`
                        : '-'}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="p-1 text-gray-400 hover:text-white transition-colors"
                          aria-label={`Edit student ${student.initials}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeStudent(student.initials)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          aria-label={`Remove student ${student.initials}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No students added yet</p>
          <p className="text-sm mt-1">Add students using the form above or import from CSV</p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-800">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={nextStep}
          disabled={!canProceed}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          Next: Generate
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* CSV Import Modal */}
      {showImportModal && (
        <CSVImportModal
          onImport={handleCSVImport}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  )
}

function CSVImportModal({
  onImport,
  onClose,
}: {
  onImport: (csv: string) => void
  onClose: () => void
}) {
  const [csvText, setCsvText] = useState('')

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setCsvText(event.target?.result as string)
    }
    reader.readAsText(file)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Import Students from CSV</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-300">
            <p className="font-medium mb-2">Expected CSV format:</p>
            <code className="text-xs text-gray-400 block">
              initials,A,B,C,D,trend,notable,observations
              <br />
              JK,6,5,7,5,improving,Science Fair,Strong lab partner|Good at data analysis
            </code>
            <p className="mt-2 text-gray-400 text-xs">
              Use | to separate multiple observations. Columns are flexible.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload CSV File
            </label>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-800 file:text-gray-300 hover:file:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Or paste CSV content
            </label>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={8}
              placeholder="initials,A,B,C,D,trend,notable,observations&#10;JK,6,5,7,5,improving,Science Fair,Strong lab partner"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onImport(csvText)}
              disabled={!csvText.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Import
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

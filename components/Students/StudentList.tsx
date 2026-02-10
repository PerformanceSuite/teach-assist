'use client'

import { useEffect } from 'react'
import { useStudentsStore } from '@/stores/studentsStore'
import { Pencil, Trash2, Users, AlertCircle } from 'lucide-react'
import type { StudentProfile } from '@/lib/api'

interface StudentListProps {
  onEdit: (student: StudentProfile) => void
  onDelete: (student: StudentProfile) => void
}

export function StudentList({ onEdit, onDelete }: StudentListProps) {
  const { students, isLoading, error, fetchStudents, clearError } = useStudentsStore()

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  // Loading skeleton
  if (isLoading && students.length === 0) {
    return (
      <div className="bg-gray-800/30 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-800">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Interests</th>
              <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-t border-gray-700">
                <td className="py-3 px-4">
                  <div className="h-4 w-32 bg-gray-700 rounded animate-pulse" />
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-gray-700 rounded-full animate-pulse" />
                    <div className="h-6 w-20 bg-gray-700 rounded-full animate-pulse" />
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-end gap-2">
                    <div className="h-8 w-8 bg-gray-700 rounded animate-pulse" />
                    <div className="h-8 w-8 bg-gray-700 rounded animate-pulse" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-400 font-medium mb-2">Error loading students</p>
        <p className="text-gray-400 text-sm mb-4">{error}</p>
        <button
          onClick={() => {
            clearError()
            fetchStudents()
          }}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  // Empty state
  if (students.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-gray-800/30 rounded-lg border border-gray-700">
        <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">No students yet</h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Add students to your roster to personalize learning experiences and track their interests.
        </p>
      </div>
    )
  }

  // Student list table
  return (
    <div className="bg-gray-800/30 rounded-lg border border-gray-700 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-800">
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Interests</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr
              key={student.id}
              className="border-t border-gray-700 hover:bg-gray-800/50 transition-colors"
            >
              <td className="py-3 px-4 text-white font-medium">{student.name}</td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1.5">
                  {student.interests && student.interests.length > 0 ? (
                    student.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-xs">No interests added</span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onEdit(student)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    title="Edit student"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(student)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete student"
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
  )
}

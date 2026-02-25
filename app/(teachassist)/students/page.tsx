'use client'

import { useState, useEffect } from 'react'
import { Users, Plus } from 'lucide-react'
import { StudentList, StudentForm } from '@/components/Students'
import { useStudentsStore } from '@/stores/studentsStore'
import type { StudentProfile } from '@/lib/api'

export default function StudentsPage() {
  const { students, fetchStudents, addStudent, updateStudent, deleteStudent } = useStudentsStore()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<StudentProfile | null>(null)

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleAddClick = () => {
    setEditingStudent(null)
    setIsFormOpen(true)
  }

  const handleEditClick = (student: StudentProfile) => {
    setEditingStudent(student)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (student: StudentProfile) => {
    setDeleteConfirm(student)
  }

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return
    await deleteStudent(deleteConfirm.id)
    setDeleteConfirm(null)
  }

  const handleSave = async (data: { name: string; interests: string[]; accommodations: string[] }) => {
    setIsSaving(true)
    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, data)
      } else {
        await addStudent(data)
      }
      setIsFormOpen(false)
      setEditingStudent(null)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingStudent(null)
  }

  return (
    <div className="h-full overflow-auto p-6 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-500/20 to-violet-600/10 rounded-xl">
                <Users className="w-6 h-6 text-violet-400" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Student Roster</h1>
            </div>
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Student
            </button>
          </div>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
            Manage your student profiles. Add interests and accommodations to personalize learning
            and ensure AI responses meet individual student needs.
          </p>
        </div>

        {/* Stats line */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>
            {students.length} {students.length === 1 ? 'student' : 'students'}
          </span>
        </div>

        {/* Student List */}
        <StudentList
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />

        {/* Student Form Modal */}
        <StudentForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          student={editingStudent}
          onSave={handleSave}
          isSaving={isSaving}
        />

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setDeleteConfirm(null)}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-900 rounded-xl border border-gray-300 dark:border-gray-700 p-6 w-full max-w-sm mx-4 shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Student?</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Are you sure you want to delete <span className="text-gray-900 dark:text-white font-medium">{deleteConfirm.name}</span>?
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * ComplianceNote - Privacy and compliance information for welcome page
 * Shows what standards TeachAssist adheres to
 */

import { Shield, ExternalLink } from 'lucide-react'

export function ComplianceNote() {
  return (
    <div className="mt-10 p-5 rounded-2xl bg-green-50 dark:bg-green-950/20 border border-green-200/50 dark:border-green-900/50 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-green-100 dark:bg-green-500/10 rounded-xl shrink-0">
          <Shield className="w-5 h-5 text-green-600 dark:text-green-500" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
            Privacy-First Design
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            TeachAssist is designed with student privacy in mind. We support{' '}
            <a
              href="https://www2.ed.gov/policy/gen/guid/fpco/ferpa/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 inline-flex items-center gap-0.5"
            >
              FERPA
              <ExternalLink className="w-3 h-3" />
            </a>
            {' '}and{' '}
            <a
              href="https://www.ftc.gov/business-guidance/privacy-security/childrens-privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 inline-flex items-center gap-0.5"
            >
              COPPA
              <ExternalLink className="w-3 h-3" />
            </a>
            {' '}compliance by using pseudonyms only, avoiding PII collection, and keeping
            you in control of what data is shared.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Use initials or codes instead of student names. You control all uploads.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ComplianceNote

/**
 * ComplianceNote - Privacy and compliance information for welcome page
 * Shows what standards TeachAssist adheres to
 */

import { Shield, ExternalLink } from 'lucide-react'

export function ComplianceNote() {
  return (
    <div className="mt-8 p-4 rounded-lg bg-gray-900/50 border border-gray-800">
      <div className="flex items-start gap-3">
        <div className="p-1.5 bg-green-500/10 rounded-lg shrink-0">
          <Shield className="w-4 h-4 text-green-400" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-gray-200 mb-1">
            Privacy-First Design
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            TeachAssist is designed with student privacy in mind. We support{' '}
            <a
              href="https://www2.ed.gov/policy/gen/guid/fpco/ferpa/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-0.5"
            >
              FERPA
              <ExternalLink className="w-3 h-3" />
            </a>
            {' '}and{' '}
            <a
              href="https://www.ftc.gov/business-guidance/privacy-security/childrens-privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-0.5"
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

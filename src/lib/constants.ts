// src/lib/constants.ts

export const DEPARTMENTS = [
  'Instrument',
  'Turbo-Machinery',
  'Mechanical',
  'Electrical',
  'HVAC',
  'Production',
  'Lab',
  'Inspection',
  'Painting',
  'Civil',
  'Condition Monitoring',
  'Reliability',
  'Telecom',
  'Safety',
  'Subsea',
] as const;

export type Department = typeof DEPARTMENTS[number];

export const CRITICALITY_LEVELS = [
  'Low',
  'Medium',
  'High',
  'Critical',
] as const;

export type Criticality = typeof CRITICALITY_LEVELS[number];

export const DEFERRAL_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  RETURNED: 'returned',
  APPROVED_BY_RELIABILITY: 'approved_by_reliability',
  PENDING_SIGNATURES: 'pending_signatures',
  PARTIALLY_SIGNED: 'partially_signed',
  FULLY_APPROVED: 'fully_approved',
  REJECTED: 'rejected',
  IMPLEMENTED: 'implemented',
} as const;

export type DeferralStatus = typeof DEFERRAL_STATUS[keyof typeof DEFERRAL_STATUS];

export const STATUS_LABELS: Record<DeferralStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  returned: 'Returned',
  approved_by_reliability: 'Approved by Reliability',
  pending_signatures: 'Pending Signatures',
  partially_signed: 'Partially Signed',
  fully_approved: 'Fully Approved',
  rejected: 'Rejected',
  implemented: 'Implemented',
};

export const STATUS_COLORS: Record<DeferralStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  returned: 'bg-orange-100 text-orange-800',
  approved_by_reliability: 'bg-green-100 text-green-800',
  pending_signatures: 'bg-purple-100 text-purple-800',
  partially_signed: 'bg-indigo-100 text-indigo-800',
  fully_approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  implemented: 'bg-teal-100 text-teal-800',
};

export const SIGNATURE_ROLES = {
  DEPARTMENT_HEAD: 'department_head',
  MAINT_SUPPORT_RELIABILITY_GM: 'maint_support_reliability_gm',
  DISCIPLINE_TA: 'discipline_ta',
  AD_HOC: 'ad_hoc',
  MAINTENANCE_RESPONSIBLE_GM: 'maintenance_responsible_gm',
  SOD: 'sod',
  DFGM: 'dfgm',
} as const;

export type SignatureRole = typeof SIGNATURE_ROLES[keyof typeof SIGNATURE_ROLES];

export const SIGNATURE_ROLE_LABELS: Record<SignatureRole, string> = {
  department_head: 'Department Head',
  maint_support_reliability_gm: 'Maint. Support and Reliability GM',
  discipline_ta: 'Discipline TA',
  ad_hoc: 'Ad Hoc',
  maintenance_responsible_gm: 'Maintenance/Responsible GM',
  sod: 'SOD',
  dfgm: 'DFGM',
};

export const RISK_CATEGORIES = ['People', 'Asset', 'Environment', 'Reputation'] as const;
export type RiskCategory = typeof RISK_CATEGORIES[number];

export const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Very High'] as const;
export type SeverityLevel = typeof SEVERITY_LEVELS[number];

export const LIKELIHOOD_LEVELS = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'] as const;
export type LikelihoodLevel = typeof LIKELIHOOD_LEVELS[number];

export const USER_ROLES = {
  USER: 'user',
  RELIABILITY: 'reliability',
  APPROVER: 'approver',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const NOTIFICATION_TYPES = {
  NEW_SUBMISSION: 'new_submission',
  RETURNED: 'returned',
  APPROVED: 'approved',
  SIGNATURE_REQUIRED: 'signature_required',
  COMMENT_ADDED: 'comment_added',
  STATUS_CHANGED: 'status_changed',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

// File upload constants
export const ALLOWED_FILE_TYPES = {
  PDF: 'application/pdf',
  JPEG: 'image/jpeg',
  JPG: 'image/jpg',
  PNG: 'image/png',
} as const;

export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default

export const FILE_TYPE_EXTENSIONS: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
};

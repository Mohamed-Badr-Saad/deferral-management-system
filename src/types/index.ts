// src/types/index.ts
import type { 
  Department, 
  Criticality, 
  DeferralStatus, 
  SignatureRole,
  RiskCategory,
  SeverityLevel,
  LikelihoodLevel,
  UserRole,
  NotificationType 
} from '@/lib/constants';

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  department?: Department | null;
  position?: string | null;
  role: UserRole;
  emailVerified?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Risk Assessment
export interface RiskAssessment {
  people: RiskItem;
  asset: RiskItem;
  environment: RiskItem;
  reputation: RiskItem;
}

export interface RiskItem {
  severity: SeverityLevel;
  likelihood: LikelihoodLevel;
  justification: string;
}

// Mitigation Action
export interface MitigationAction {
  actionNo: number;
  action: string;
  owner: string;
  date: string;
  comments: string;
}

// Signature
export interface Signature {
  role: SignatureRole;
  userId: string;
  name: string;
  position: string;
  signedAt: string;
  comments?: string;
}

// Comment
export interface Comment {
  userId: string;
  userName: string;
  comment: string;
  timestamp: string;
}

// Deferral
export interface Deferral {
  id: string;
  deferralCode: string;
  
  // Initiator info
  initiatorId: string;
  initiatorName: string;
  jobTitle: string;
  department: Department;
  
  // Work order details
  workOrderNumbers: string[];
  equipmentFullCodes: string[];
  equipmentDescription: string;
  equipmentSafetyCriticality?: Criticality | null;
  taskCriticality?: Criticality | null;
  
  // Dates
  deferralRequestDate: Date;
  currentLAFD?: Date | null;
  deferredToNewLAFD: Date;
  
  // Descriptions
  description: string;
  justification: string;
  consequence: string;
  
  // Risk and mitigations
  riskAssessment?: RiskAssessment | null;
  mitigations?: MitigationAction[] | null;
  
  // Status
  status: DeferralStatus;
  submittedAt?: Date | null;
  reviewedAt?: Date | null;
  reviewedBy?: string | null;
  reviewComments?: string | null;
  
  // Signatures
  requiredSignatures: SignatureRole[];
  signatures?: Signature[] | null;
  
  // Comments
  comments?: Comment[] | null;
  
  // Implementation
  implementedBy?: string | null;
  implementedDate?: Date | null;
  approvedBy?: string | null;
  approvalDate?: Date | null;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  initiator?: User;
  reviewer?: User | null;
  attachments?: Attachment[];
}

// Attachment
export interface Attachment {
  id: string;
  deferralId: string;
  fileName: string;
  fileType: string;
  fileSize?: string | null;
  filePath: string;
  uploadedBy: string;
  uploadedAt: Date;
  user?: User;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  deferralId?: string | null;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: Date;
  user?: User;
  deferral?: Deferral | null;
}

// Audit Log
export interface AuditLog {
  id: string;
  deferralId?: string | null;
  userId: string;
  action: string;
  details?: any;
  timestamp: Date;
  user?: User;
  deferral?: Deferral | null;
}

// Form types
export interface DeferralFormData {
  // Initiator
  initiatorName: string;
  jobTitle: string;
  department: Department;
  
  // Work Order
  workOrderNumbers: string[];
  equipmentFullCodes: string[];
  equipmentDescription: string;
  equipmentSafetyCriticality?: Criticality;
  taskCriticality?: Criticality;
  
  // Dates
  deferralRequestDate: Date;
  currentLAFD?: Date;
  deferredToNewLAFD: Date;
  
  // Descriptions
  description: string;
  justification: string;
  consequence: string;
  
  // Risk Assessment
  riskAssessment?: RiskAssessment;
  
  // Mitigations
  mitigations?: MitigationAction[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
  };
}

// Filter types
export interface DeferralFilters {
  status?: DeferralStatus[];
  department?: Department[];
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  initiatorId?: string;
  reviewedBy?: string;
}

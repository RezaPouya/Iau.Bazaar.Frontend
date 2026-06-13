// app/types/product-file.ts

export type ProductFileApprovalStatus = 'Pending' | 'Approved' | 'Rejected'

export interface ProductFile {
  id: number
  productId: number
  fileStorageId: number
  fileUrl: string
  fileName: string
  fileSize: number
  approvalStatus: ProductFileApprovalStatus
  approvalStatusTitle: string
  rejectionReason: string | null
  displayOrder: number
  title: string | null
  description: string | null
  createdAt: string
  createdAtPersian: string
  approvedByUserId: number | null
  approvedByUserName: string | null
  approvedAt: string | null
  approvedAtPersian: string | null
}

export type LegalDocumentType = 'License' | 'Contract' | 'Certificate' | 'TaxDocument' | 'Other'

export interface ProductLegalDocument {
  id: number
  productId: number
  fileStorageId: number
  fileUrl: string
  fileName: string
  fileSize: number
  documentType: LegalDocumentType
  documentTypeTitle: string
  documentNumber: string | null
  issueDate: string | null
  issueDatePersian: string | null
  expiryDate: string | null
  expiryDatePersian: string | null
  approvalStatus: ProductFileApprovalStatus
  approvalStatusTitle: string
  rejectionReason: string | null
  title: string
  description: string | null
  createdAt: string
  createdAtPersian: string
  approvedByUserId: number | null
  approvedByUserName: string | null
  approvedAt: string | null
  approvedAtPersian: string | null
}

export interface UploadProductFileInput {
  productId: number
  files: File[]
  title?: string
  description?: string
}

export interface UploadLegalDocumentInput {
  productId: number
  files: File[]
  documentType: LegalDocumentType
  documentNumber?: string
  issueDate?: string
  expiryDate?: string
  title: string
  description?: string
}

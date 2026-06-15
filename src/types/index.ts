export interface Device {
  id: string
  code: string
  model: string
  serialNumber: string
  firmwareVersion: string
  standardFirmware: string
  accessories: string[]
  accountStatus: "active" | "expired" | "none"
  department: string
  photos: string[]
  status: "idle" | "borrowed" | "overdue"
  createdAt: string
  updatedAt: string
}

export interface BorrowRecord {
  id: string
  deviceId: string
  customer: string
  project: string
  borrower: string
  borrowerDepartment: string
  borrowDate: string
  expectedReturnDate: string
  actualReturnDate: string | null
  demoScenario: string
  hasSensitiveData: boolean
  status: "borrowed" | "returned" | "overdue"
  returnCheck?: ReturnCheck
}

export interface ReturnCheck {
  accessoriesComplete: boolean
  accessoriesNote: string
  noNewScratches: boolean
  scratchesNote: string
  batteryLevel: number
  dataCleared: boolean
  dataClearNote: string
  firmwareRolledBack: boolean
  firmwareNote: string
  checkedAt: string
  checkedBy: string
  passed: boolean
}

export interface AlertItem {
  id: string
  type: "overdue" | "sensitive_data" | "non_standard_firmware"
  deviceId: string
  borrowRecordId: string
  message: string
  severity: "high" | "medium" | "low"
  createdAt: string
  resolved: boolean
}

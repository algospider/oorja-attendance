export interface SessionConfig {
  meetingLink: string | null;
  meetingTitle: string;
  instructor: string;
  sessionActive: boolean;
  customNotice: string;
  autoRedirectDelay?: number;
  totalAttendees?: number;
  adminPassword?: string;
}

export interface Attendee {
  id: string;
  name: string;
  rollNo: string;
  timestamp: string;
  status: 'Present' | 'Late' | 'Absent' | 'Excused';
  device: string;
  notes: string;
  sessionTitle?: string;
}

export interface AttendanceReceipt {
  id: string;
  name: string;
  rollNo: string;
  timestamp: string;
  status: string;
  securityHash: string;
}

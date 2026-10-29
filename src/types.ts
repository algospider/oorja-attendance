export interface SessionItem {
  id: string;
  title: string;
  time: string;
  speaker: string;
  meetingLink: string | null;
  active: boolean;
}

export interface SessionConfig {
  sessions: SessionItem[];
  customNotice: string;
  totalAttendees?: number;
}

export interface Attendee {
  id: string;
  name: string;
  rollNo: string;
  sessionId?: string;
  sessionTitle?: string;
  timestamp: string;
  status: 'Present' | 'Late' | 'Absent' | 'Excused';
  device: string;
  notes: string;
}

export interface AttendanceReceipt {
  id: string;
  name: string;
  rollNo: string;
  sessionTitle: string;
  timestamp: string;
  status: string;
  securityHash: string;
}

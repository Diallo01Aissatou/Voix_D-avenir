export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  password: string; // 🔑 ajouté
  role: 'mentoree' | 'mentore' | 'admin';
  photo: string;
  age?: number;
  city?: string;
  profession?: string;
  expertise?: string[];
  bio?: string;
  education?: string;
  interests?: string[];
  availableDays?: string[];
  startTime?: string;
  endTime?: string;
}


export interface MentorshipRequest {
  _id: string;
  mentoree: string | User;
  mentore: string | User;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  responseMessage?: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface Message {
  _id: string;
  sender: string | User;
  recipient: string | User;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  timestamp: string;
  read: boolean;
  readAt?: string;
  messageType: 'text' | 'file' | 'system';
  mentorshipId?: string;
  isReported?: boolean;
  reportReason?: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'article';
  category: string;
  url: string;
  downloadCount: number;
}

export interface ExpertWoman {
  id: string;
  name: string;
  profession: string;
  company: string;
  domain: string;
  bio: string;
  achievements: string[];
  quote: string;
  image: string;
  videoUrl?: string;
  isFeatured?: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: 'webinaire' | 'atelier' | 'conférence';

  speaker: string;
  registrationUrl: string;
  image: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: 'stage' | 'bourse' | 'concours';
  deadline: string;
  organization: string;
  applyUrl: string;
  requirements: string[];
}
export interface Session {
  _id: string;
  mentore: User;
  mentoree: User;
  topic: string;
  description?: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  mode: 'online' | 'video' | 'presential';
  status: 'scheduled' | 'confirmed' | 'completed' | 'canceled';
  meetingLink?: string;
  resources?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointement {
  id: string;
  mentoreeId: string;
  mentoreId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'canceled';
  notes?: string;
}

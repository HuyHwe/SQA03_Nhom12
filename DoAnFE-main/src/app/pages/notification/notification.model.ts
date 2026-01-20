export interface Notification {
  id: number;
  userId: number;
  role: string;
  title: string;
  message: string;
  type: string;
  status: 'UNREAD' | 'READ';
  createdAt: string;
  actionUrl?: string;
}
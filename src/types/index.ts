export type PosterStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'posting' | 'posted' | 'expired' | 'removed';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export type PostingStatus = 'pending' | 'posted' | 'expired' | 'removed';

export type ExceptionType = 'damaged' | 'covered' | 'unauthorized' | 'wrong_position' | 'expired_not_removed';

export type ExceptionStatus = 'pending' | 'processing' | 'resolved';

export interface Poster {
  id: string;
  activityName: string;
  club: string;
  size: string;
  area: string;
  approvalNumber: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  status: PosterStatus;
  createdAt: string;
}

export interface Application {
  id: string;
  posterId: string;
  applicant: string;
  contact: string;
  bulletinBoardId: string;
  quantity: number;
  needTop: boolean;
  status: ApplicationStatus;
  rejectReason?: string;
  createdAt: string;
  auditedAt?: string;
}

export interface BulletinBoard {
  id: string;
  name: string;
  location: string;
  totalSlots: number;
  occupiedSlots: number;
  area: string;
}

export interface PostingItem {
  id: string;
  applicationId: string;
  bulletinBoardId: string;
  quantity: number;
  needTop: boolean;
  status: PostingStatus;
  photoUrl?: string;
  postedAt?: string;
  removedAt?: string;
}

export interface Exception {
  id: string;
  type: ExceptionType;
  description: string;
  location: string;
  photoUrl?: string;
  reporter: string;
  status: ExceptionStatus;
  relatedPosterId?: string;
  createdAt: string;
  resolvedAt?: string;
}

export const POSTER_STATUS_LABELS: Record<PosterStatus, string> = {
  draft: '草稿',
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回',
  posting: '待张贴',
  posted: '已张贴',
  expired: '已到期',
  removed: '已撤下',
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回',
};

export const POSTING_STATUS_LABELS: Record<PostingStatus, string> = {
  pending: '待张贴',
  posted: '已张贴',
  expired: '已到期',
  removed: '已撤下',
};

export const EXCEPTION_TYPE_LABELS: Record<ExceptionType, string> = {
  damaged: '海报破损',
  covered: '覆盖他人海报',
  unauthorized: '未审批张贴',
  wrong_position: '贴错位置',
  expired_not_removed: '到期未撤下',
};

export const EXCEPTION_STATUS_LABELS: Record<ExceptionStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决',
};

export const POSTER_SIZES = ['A4', 'A3', 'A2', '60×90cm', '其他'];

export const AREAS = ['教学区', '生活区', '食堂区', '宿舍区', '体育馆', '图书馆'];

export const EXCEPTION_TYPES: { value: ExceptionType; label: string }[] = [
  { value: 'damaged', label: '海报破损' },
  { value: 'covered', label: '覆盖他人海报' },
  { value: 'unauthorized', label: '未审批张贴' },
  { value: 'wrong_position', label: '贴错位置' },
  { value: 'expired_not_removed', label: '到期未撤下' },
];

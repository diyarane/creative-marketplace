import type {
  Role,
  ProjectStatus,
  ProposalStatus,
  RevisionStatus,
  PaymentStatus,
  SubscriptionStatus,
} from "@/lib/db/schema";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  active: boolean;
  createdAt: string | Date;
}

export interface CreatorProfileDTO {
  id: string;
  userId: string;
  headline: string;
  bio: string;
  specialization: string;
  location: string;
  experience: number;
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  availability: "AVAILABLE" | "BUSY" | "UNAVAILABLE";
  coverGradient: string;
  user: PublicUser;
}

export interface PortfolioItemDTO {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  category: string;
  mediaType: "IMAGE" | "VIDEO";
  mediaUrl: string;
  thumbnailUrl: string;
  gradient: string;
  createdAt: string | Date;
}

export interface ServiceDTO {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  category: string;
  price: number;
  deliveryDays: number;
  revisionsIncluded: number;
  active: boolean;
}

export interface ProjectDTO {
  id: string;
  clientId: string;
  creatorId: string | null;
  title: string;
  description: string;
  requirements: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  deadline: string | Date;
  status: ProjectStatus;
  agreedPrice: number | null;
  agreedRevisions: number | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  client?: PublicUser;
  creator?: CreatorProfileDTO | null;
  proposalCount?: number;
}

export interface ProposalDTO {
  id: string;
  projectId: string;
  creatorId: string;
  price: number;
  deliveryDays: number;
  message: string;
  revisionsIncluded: number;
  status: ProposalStatus;
  createdAt: string | Date;
  creator?: CreatorProfileDTO;
}

export interface RevisionDTO {
  id: string;
  projectId: string;
  requestedBy: string;
  description: string;
  status: RevisionStatus;
  createdAt: string | Date;
  resolvedAt: string | Date | null;
}

export interface ProjectFileDTO {
  id: string;
  projectId: string;
  uploadedBy: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  kind: "REFERENCE" | "SUBMISSION";
  note: string;
  createdAt: string | Date;
}

export interface PaymentDTO {
  id: string;
  projectId: string;
  clientId: string;
  creatorId: string;
  amount: number;
  platformFee: number;
  status: PaymentStatus;
  method: string;
  transactionId: string;
  createdAt: string | Date;
  project?: ProjectDTO;
}

export interface ReviewDTO {
  id: string;
  projectId: string;
  reviewerId: string;
  reviewedUserId: string;
  rating: number;
  comment: string;
  createdAt: string | Date;
  reviewer?: PublicUser;
}

export interface NotificationDTO {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string | Date;
}

export interface MessageDTO {
  id: string;
  senderId: string;
  receiverId: string;
  projectId: string | null;
  content: string;
  read: boolean;
  createdAt: string | Date;
  sender?: PublicUser;
  receiver?: PublicUser;
}

export interface SubscriptionPlanDTO {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  features: string[];
  highlighted: boolean;
}

export interface SubscriptionDTO {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string | Date;
  endDate: string | Date;
  plan?: SubscriptionPlanDTO;
}

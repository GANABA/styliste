import {
  PortfolioItem as PrismaPortfolioItem,
  Notification as PrismaNotification,
  NotificationType,
  NotificationChannel,
  NotificationStatus,
} from '@prisma/client'

export type PortfolioItem = PrismaPortfolioItem
export type Notification = PrismaNotification

export { NotificationType, NotificationChannel, NotificationStatus }

export type PortfolioItemPublic = Pick<
  PrismaPortfolioItem,
  'id' | 'imageUrl' | 'thumbnailUrl' | 'title' | 'description' | 'tags' | 'viewCount'
>

export interface StylistPublicProfile {
  id: string
  slug: string
  businessName: string | null
  phone: string | null
  city: string | null
  logoUrl: string | null
  portfolioItems: PortfolioItemPublic[]
}

export interface CreatePortfolioItemInput {
  title: string
  description?: string
  tags?: string[]
  clientConsent?: boolean
}

export interface SendNotificationInput {
  type: NotificationType
}

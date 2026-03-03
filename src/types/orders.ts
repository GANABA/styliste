import {
  Order as PrismaOrder,
  OrderPhoto as PrismaOrderPhoto,
  OrderHistory as PrismaOrderHistory,
  OrderStatus,
  UrgencyLevel,
  FabricProvidedBy,
  PaymentStatus,
  PhotoType,
  OrderChangeType,
  Client,
} from '@prisma/client'

// Re-export des enums Prisma
export { OrderStatus, UrgencyLevel, FabricProvidedBy, PaymentStatus, PhotoType, OrderChangeType }

export type Order = PrismaOrder
export type OrderPhoto = PrismaOrderPhoto
export type OrderHistory = PrismaOrderHistory

export type OrderWithRelations = PrismaOrder & {
  client: Pick<Client, 'id' | 'name' | 'phone' | 'email'>
  photos: PrismaOrderPhoto[]
  history: PrismaOrderHistory[]
}

export type OrderListItem = PrismaOrder & {
  client: Pick<Client, 'id' | 'name' | 'phone'>
  photos: Pick<PrismaOrderPhoto, 'id' | 'thumbnailUrl' | 'photoType'>[]
  _count: { photos: number }
}

// Inputs API
export interface CreateOrderInput {
  clientId: string
  garmentType: string
  description?: string
  notes?: string
  specialRequests?: string
  promisedDate: string // ISO date string
  urgencyLevel?: UrgencyLevel
  fabricProvidedBy: FabricProvidedBy
  fabricReceivedDate?: string
  fabricDescription?: string
  totalPrice: number
  advanceAmount?: number
  measurementsSnapshot?: Record<string, unknown>
}

export interface UpdateOrderInput {
  garmentType?: string
  description?: string
  notes?: string
  specialRequests?: string
  promisedDate?: string
  urgencyLevel?: UrgencyLevel
  fabricProvidedBy?: FabricProvidedBy
  fabricReceivedDate?: string | null
  fabricDescription?: string
  totalPrice?: number
  advanceAmount?: number
  totalPaid?: number
  paymentStatus?: PaymentStatus
  measurementsSnapshot?: Record<string, unknown>
}

export interface TransitionStatusInput {
  status: OrderStatus
  cancellationReason?: string
  actualDeliveryDate?: string
}

// Réponse paginée
export interface OrdersListResponse {
  orders: OrderListItem[]
  meta: {
    activeCount: number
    activeLimit: number
  }
}

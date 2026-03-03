import { OrderStatus } from '@prisma/client'

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  QUOTE:       [OrderStatus.IN_PROGRESS, OrderStatus.CANCELED],
  IN_PROGRESS: [OrderStatus.READY, OrderStatus.CANCELED],
  READY:       [OrderStatus.DELIVERED, OrderStatus.CANCELED],
  DELIVERED:   [],
  CANCELED:    [],
}

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to)
}

export function getNextStatuses(current: OrderStatus): OrderStatus[] {
  return VALID_TRANSITIONS[current]
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  QUOTE:       'Devis',
  IN_PROGRESS: 'En cours',
  READY:       'Prêt',
  DELIVERED:   'Livré',
  CANCELED:    'Annulé',
}

export const STATUS_NEXT_LABEL: Record<OrderStatus, string> = {
  QUOTE:       'Démarrer',
  IN_PROGRESS: 'Marquer Prêt',
  READY:       'Marquer Livré',
  DELIVERED:   '',
  CANCELED:    '',
}

// Statuts considérés comme "actifs" pour le calcul de la limite de capacité
export const ACTIVE_STATUSES: OrderStatus[] = [
  OrderStatus.QUOTE,
  OrderStatus.IN_PROGRESS,
  OrderStatus.READY,
]

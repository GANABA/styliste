import { Prisma } from '@prisma/client'

type TransactionClient = Omit<
  Prisma.TransactionClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

export async function generateOrderNumber(
  tx: TransactionClient,
  stylistId: string
): Promise<string> {
  const year = new Date().getFullYear()

  // Compter TOUTES les commandes du styliste pour l'année en cours (séquence par styliste)
  const count = await tx.order.count({
    where: { stylistId },
  })

  // Inclure un préfixe stylist court (4 derniers chars de l'ID) pour garantir l'unicité globale
  const stylistSuffix = stylistId.replace(/-/g, '').slice(-4).toUpperCase()
  const sequence = String(count + 1).padStart(4, '0')
  return `ORD-${year}-${stylistSuffix}-${sequence}`
}

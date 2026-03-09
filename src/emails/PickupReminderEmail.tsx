import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface PickupReminderEmailProps {
  clientName: string
  garmentType: string
  orderNumber: string
  promisedDate: string
  stylistName: string
  stylistPhone: string
  stylistCity?: string
}

export function PickupReminderEmail({
  clientName,
  garmentType,
  orderNumber,
  promisedDate,
  stylistName,
  stylistPhone,
  stylistCity,
}: PickupReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Rappel de retrait — {garmentType} vous attend</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>N&apos;oubliez pas votre commande !</Heading>

          <Text style={text}>Bonjour {clientName},</Text>

          <Text style={text}>
            Votre <strong>{garmentType}</strong> (commande {orderNumber}) est prêt(e) et attend d&apos;être retiré(e).
          </Text>

          <Section style={infoBox}>
            <Text style={infoLabel}>Date promise :</Text>
            <Text style={infoValue}>{promisedDate}</Text>

            <Text style={infoLabel}>Votre styliste :</Text>
            <Text style={infoValue}>
              {stylistName}
              {stylistCity && ` — ${stylistCity}`}
            </Text>
            <Text style={infoValue}>📞 {stylistPhone}</Text>
          </Section>

          <Text style={text}>
            Contactez votre styliste pour convenir d&apos;un horaire qui vous convient.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Ce message vous a été envoyé par {stylistName} via Styliste.com
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '24px',
  maxWidth: '600px',
  borderRadius: '8px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 24px',
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const infoBox = {
  backgroundColor: '#eff6ff',
  border: '1px solid #bfdbfe',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
}

const infoLabel = {
  color: '#3b82f6',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  margin: '8px 0 2px',
}

const infoValue = {
  color: '#1e3a5f',
  fontSize: '15px',
  margin: '0 0 8px',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0 16px',
}

const footer = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '0',
}

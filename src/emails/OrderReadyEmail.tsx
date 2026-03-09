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

interface OrderReadyEmailProps {
  clientName: string
  garmentType: string
  stylistName: string
  stylistPhone: string
  stylistCity?: string
  orderNumber: string
}

export function OrderReadyEmail({
  clientName,
  garmentType,
  stylistName,
  stylistPhone,
  stylistCity,
  orderNumber,
}: OrderReadyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Votre {garmentType} est prêt(e) à être retiré(e)</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Votre commande est prête !</Heading>

          <Text style={text}>Bonjour {clientName},</Text>

          <Text style={text}>
            Votre <strong>{garmentType}</strong> (commande {orderNumber}) est terminé(e) et prêt(e) à être retiré(e).
          </Text>

          <Section style={infoBox}>
            <Text style={infoLabel}>Pour récupérer votre commande :</Text>
            <Text style={infoText}>
              <strong>{stylistName}</strong>
              {stylistCity && ` — ${stylistCity}`}
            </Text>
            <Text style={infoText}>Téléphone : {stylistPhone}</Text>
          </Section>

          <Text style={text}>
            N&apos;hésitez pas à contacter votre styliste pour convenir d&apos;un horaire de retrait.
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
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
}

const infoLabel = {
  color: '#15803d',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const infoText = {
  color: '#374151',
  fontSize: '15px',
  margin: '0 0 4px',
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

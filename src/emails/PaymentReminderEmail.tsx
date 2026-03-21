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

interface PaymentReminderEmailProps {
  clientName: string
  garmentType: string
  orderNumber: string
  totalPrice: number
  totalPaid: number
  balanceDue: number
  stylistName: string
  stylistPhone: string
}

function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA'
}

export function PaymentReminderEmail({
  clientName,
  garmentType,
  orderNumber,
  totalPrice,
  totalPaid,
  balanceDue,
  stylistName,
  stylistPhone,
}: PaymentReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Rappel de paiement : {garmentType} ({orderNumber})</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Rappel de paiement</Heading>

          <Text style={text}>Bonjour {clientName},</Text>

          <Text style={text}>
            Voici un rappel concernant le solde restant dû pour votre commande{' '}
            <strong>{garmentType}</strong> ({orderNumber}).
          </Text>

          <Section style={infoBox}>
            <Row label="Prix total" value={formatFCFA(totalPrice)} />
            <Row label="Déjà payé" value={formatFCFA(totalPaid)} />
            <Hr style={hrInner} />
            <Row label="Solde restant" value={formatFCFA(balanceDue)} bold />
          </Section>

          <Text style={text}>
            Pour régler votre solde ou pour toute question, contactez votre styliste :
          </Text>

          <Text style={contactText}>
            <strong>{stylistName}</strong> · {stylistPhone}
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

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <Section style={{ margin: '4px 0', display: 'flex', justifyContent: 'space-between' }}>
      <Text style={{ ...rowText, color: '#6b7280', display: 'inline' }}>{label}</Text>
      <Text style={{ ...rowText, fontWeight: bold ? '700' : '400', display: 'inline', float: 'right' as const }}>{value}</Text>
    </Section>
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
  backgroundColor: '#fffbeb',
  border: '1px solid #fde68a',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
}

const hrInner = {
  borderColor: '#fde68a',
  margin: '8px 0',
}

const rowText = {
  color: '#374151',
  fontSize: '15px',
  margin: '2px 0',
}

const contactText = {
  color: '#374151',
  fontSize: '15px',
  margin: '0 0 24px',
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

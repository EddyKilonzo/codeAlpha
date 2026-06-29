"use client"

import { OutlookEmailSimulation, GmailSimulation } from './EmailSimulation'
import { LoginPageSimulation } from './LoginPageSimulation'
import { SMSSimulation } from './SMSSimulation'
import { TeamsSimulation } from './ChatSimulation'
import { BrowserWarningSimulation } from './BrowserWarningSimulation'
import type { Simulation } from '@/types'

export function SimulationRenderer({ sim }: { sim: Simulation }) {
  if (sim.type === 'email-outlook') return <OutlookEmailSimulation simulation={sim} />
  if (sim.type === 'email-gmail') return <GmailSimulation simulation={sim} />
  if (sim.type === 'login-page') return <LoginPageSimulation simulation={sim} />
  if (sim.type === 'sms') return <SMSSimulation simulation={sim} />
  if (sim.type === 'teams-message') return <TeamsSimulation simulation={sim} />
  if (sim.type === 'browser-warning') return <BrowserWarningSimulation simulation={sim} />
  return <p className="text-sm text-muted-foreground">Simulation type not implemented yet.</p>
}

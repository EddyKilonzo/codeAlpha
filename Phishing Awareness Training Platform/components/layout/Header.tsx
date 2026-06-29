"use client"

import { Sun, Moon, Menu } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useProgress } from '@/hooks/useProgress'
import { MobileNav } from './MobileNav'

export function Header() {
  const { theme, setTheme } = useTheme()
  const { progress, isHydrated, overallProgress } = useProgress()

  const pct = isHydrated ? overallProgress() : 0

  const levelTitles: Record<number, string> = {
    1: 'Rookie', 2: 'Learner', 3: 'Aware', 4: 'Vigilant', 5: 'Defender',
    6: 'Analyst', 7: 'Guardian', 8: 'Expert', 9: 'Specialist', 10: 'Cyber Guardian',
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur px-4 lg:px-6">
      {/* Mobile Nav Trigger */}
      <MobileNav />

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-foreground truncate hidden sm:block">
          Phishing Awareness Training
        </h1>
      </div>

      {/* Center: Progress */}
      <div className="hidden md:flex flex-col items-center gap-1 w-48">
        <div className="flex items-center justify-between w-full">
          <span className="text-[10px] text-muted-foreground">Course Progress</span>
          <span className="text-[10px] font-semibold text-brand">{pct}%</span>
        </div>
        <Progress value={pct} className="h-1.5 w-full" />
      </div>

      {/* Right: level badge + dark mode */}
      <div className="flex items-center gap-2">
        {isHydrated && (
          <Badge
            variant="outline"
            className="hidden sm:flex border-brand/30 bg-brand/5 text-brand text-[10px] font-semibold"
          >
            Lv.{progress.level} · {levelTitles[progress.level] ?? 'Rookie'}
          </Badge>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  )
}

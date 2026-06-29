import { CertificateTemplate } from '@/components/certificate/CertificateTemplate'

const SAMPLE: import('@/components/certificate/CertificateTemplate').CertificateData = {
  userName: 'Jane Smith',
  completionDate: '29 June 2026',
  averageScore: 94,
  certificateId: 'PHG-A3F7C2D1',
  totalModules: 6,
}

export default function CertificatePreviewPage() {
  return (
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col items-center justify-center py-16 px-4 gap-6">
      <div className="text-center space-y-1">
        <p className="text-xs font-bold uppercase tracking-widest text-brand">Certificate Preview</p>
        <h1 className="text-2xl font-extrabold text-foreground">PhishShield Certificate of Completion</h1>
        <p className="text-sm text-muted-foreground">Sample rendering with brand styles</p>
      </div>
      <div className="overflow-x-auto rounded-2xl shadow-premium border border-black/[0.07]">
        <div className="min-w-[900px]">
          <CertificateTemplate data={SAMPLE} />
        </div>
      </div>
    </div>
  )
}

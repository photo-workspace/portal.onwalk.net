

type BrandCTAProps = {
  lang?: 'zh' | 'en'
  variant?: 'compact' | 'default'
}

const COPY = {
  zh: {
    main: '云原生实践 · 架构思考',
  },
  en: {
    main: 'Cloud-native practice · Architecture thinking',
  },
}

export default function BrandCTA({ lang = 'en', variant = 'default' }: BrandCTAProps) {
  const content = COPY[lang]
  const isCompact = variant === 'compact'
  const imageSize = isCompact ? 160 : 180

  return (
    <section className={`flex items-center border-t border-slate-200 ${isCompact ? 'pt-3' : 'pt-4'}`}>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium text-slate-600">{content.main}</p>
      </div>
    </section>
  )
}

'use client'

import { useState } from 'react'

type HeroSectionProps = {
    title: string
    subtitle: string
    badge: string
    tagline: string
    isLoading: boolean
    isBlurring: boolean
    onDevelop: () => void
}

export default function HeroSection({
    title,
    subtitle,
    badge,
    tagline,
    isLoading,
    isBlurring,
    onDevelop,
}: HeroSectionProps) {
    return (
        <section className="grid gap-8 rounded-large border border-border bg-surface p-6 md:p-10 shadow-sm transition-colors duration-300 relative overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-text-secondary">
                <span className="rounded-full border border-border px-3 py-1">
                    {badge}
                </span>
                <span>{tagline}</span>
            </div>

            <div className="space-y-4">
                <h1
                    className={`font-display text-3xl md:text-5xl font-bold tracking-tight text-heading transition-all duration-700 ease-in-out ${isBlurring ? 'blur-md opacity-60 grayscale' : 'blur-0 opacity-100 grayscale-0'
                        }`}
                >
                    {title}
                </h1>
                <p
                    className={`max-w-2xl text-base md:text-lg leading-relaxed text-text-secondary transition-all duration-700 ease-in-out ${isBlurring ? 'blur-sm opacity-60' : 'blur-0 opacity-100'
                        }`}
                >
                    {subtitle}
                </p>
            </div>

            <div className="flex items-center gap-4 pt-2">
                <button
                    onClick={onDevelop}
                    disabled={isLoading}
                    className="group relative inline-flex w-full md:w-auto justify-center items-center gap-2 overflow-hidden rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-text transition-all hover:border-text hover:bg-text hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <span className={`relative flex h-2 w-2`}>
                        <span className={`absolute inline-flex h-full w-full rounded-full bg-brand opacity-75 ${isLoading ? 'animate-ping' : ''}`}></span>
                        <span className={`relative inline-flex h-2 w-2 rounded-full ${isLoading ? 'bg-orange-500' : 'bg-brand'}`}></span>
                    </span>
                    <span className="relative">
                        {isLoading ? 'Developing... (显影中)' : '📷 按下快门 (Press Shutter)'}
                    </span>

                    {/* Subtle shine effect on hover */}
                    <div className="absolute inset-0 -translate-x-[100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
                </button>
            </div>
        </section>
    )
}

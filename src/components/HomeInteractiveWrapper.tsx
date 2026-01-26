'use client'

import { useState } from 'react'
import Link from 'next/link'

import { ContentItem } from '@/lib/content'
import ImageCarousel from '@/components/ImageCarousel'
import VideoGrid from '@/components/VideoGrid'
import HeroSection from '@/components/HeroSection'
import HomeSectionHeader from '@/components/onwalk/HomeSectionHeader'
import MasonryGrid from '@/components/MasonryGrid'
import { getRandomThemeLogic, getRandomMediaSubset } from '@/lib/inspiration-logic'

type HomeInteractiveWrapperProps = {
    initialTitle: string
    initialSubtitle: string
    badge: string
    tagline: string
    initialImages: ContentItem[]
    initialVideos: ContentItem[]
    latestBlogs: ContentItem[]
}
export default function HomeInteractiveWrapper({
    initialTitle,
    initialSubtitle,
    badge,
    tagline,
    initialImages,
    initialVideos,
    latestBlogs,
}: HomeInteractiveWrapperProps) {
    const [heroContent, setHeroContent] = useState({
        title: initialTitle,
        subtitle: initialSubtitle,
    })
    const [images, setImages] = useState(initialImages)
    const [videos, setVideos] = useState(initialVideos)
    const [isLoading, setIsLoading] = useState(false)
    const [isBlurring, setIsBlurring] = useState(false)

    const handleDevelopClick = async () => {
        if (isLoading) return

        setIsLoading(true)
        setIsBlurring(true)

        // Min wait for animation
        const waitPromise = new Promise(resolve => setTimeout(resolve, 800))

        try {
            const response = await fetch('/api/inspiration')

            if (response.ok) {
                await waitPromise
                const data = await response.json()
                setHeroContent({
                    title: data.title_cn,
                    subtitle: data.sub_cn,
                })

                if (data.images?.length > 0) setImages(data.images)
                if (data.videos?.length > 0) setVideos(data.videos)
                return
            } else {
                throw new Error('API failed')
            }
        } catch (error) {
            console.log('Falling back to local logic due to:', error)
            await waitPromise

            // Client-side Fallback (Offline / Export mode)
            const theme = getRandomThemeLogic()
            const freshImages = getRandomMediaSubset(initialImages, 5) // Note: This reshuffles the INITIAL set. 
            // For better variety in static mode, ideally we'd have all items, 
            // but here we just reshuffle initial props or we need to pass ALL items?
            // Let's assume shuffling initial set is "okay" or maybe we can't access allItems here without passing them.
            // The current implementation passes *a subset* as initialImages. 
            // To do true client-side shuffle of ALL, we should pass allItems to this wrapper.
            // For now, let's just shuffle the subset we have or maybe we passed full list?
            // In page.tsx: const initialImages = shuffleArray(allImages).slice(0, 5) -> We only passed 5.
            // So client-side shuffle only shuffles 5 items. That's weak.
            // BUT rewriting page.tsx to pass all is risky for payload size.
            // Compromise: Just randomize text theme locally. Media stays same or just reordered?
            // Actually, let's just randomize Theme text.

            setHeroContent({
                title: theme.cn,
                subtitle: theme.desc_cn ? `${theme.desc_cn}。` : '... ...',
            })
            // setImages(freshImages) // Optional: re-order existing 5
        } finally {
            setIsLoading(false)
            setIsBlurring(false)
        }
    }

    return (
        <>
            <HeroSection
                title={heroContent.title}
                subtitle={heroContent.subtitle}
                badge={badge}
                tagline={tagline}
                isLoading={isLoading}
                isBlurring={isBlurring}
                onDevelop={handleDevelopClick}
            />

            <section className={`space-y-6 transition-opacity duration-700 ${isBlurring ? 'opacity-80' : 'opacity-100'}`}>
                <HomeSectionHeader section="image" />
                <div className="rounded-large border border-border bg-surface p-4 md:p-6 shadow-sm min-h-[300px] md:min-h-[400px]">
                    <ImageCarousel items={images} />
                </div>
            </section>

            <section className={`space-y-6 transition-opacity duration-700 ${isBlurring ? 'opacity-80' : 'opacity-100'}`}>
                <HomeSectionHeader section="video" />
                <div className="rounded-large border border-border bg-surface p-4 md:p-6 shadow-sm min-h-[300px] md:min-h-[400px]">
                    <div className="hidden md:block">
                        <VideoGrid items={videos} columns={3} />
                    </div>
                    <div className="block md:hidden">
                        <VideoGrid items={videos} columns={2} />
                    </div>
                </div>
                <div className="flex">
                    <Link
                        href="/videos"
                        className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-text-secondary"
                    >
                        更多
                    </Link>
                </div>
            </section>

            <section className="space-y-6">
                <HomeSectionHeader section="blog" />
                <div className="rounded-large border border-border bg-surface p-4 md:p-6 shadow-sm">
                    <MasonryGrid posts={latestBlogs} />
                </div>
            </section>
        </>
    )
}

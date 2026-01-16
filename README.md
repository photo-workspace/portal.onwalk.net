# Onwalk — The Art of Walking & Visual Narrative

> A long-term growing archive of imagery and thought. Image as the portal, text as the framework.

[English](./README.md) | [中文版](./README_ZH.md) | [Explore the Archive](https://www.onwalk.net)

Onwalk is a dedicated practice of rhythmic walking and quiet observation. It serves as a living technical implementation for a photography and writing journal, mapping the intersection of urban textures and natural stillness through an integrated archive of imagery and prose.

---

## 📸 Content Philosophy

- **Walking as Seeing**: We treat the act of walking as a primary mode of observation and a form of slow visual storytelling.
- **Textual Backbone**: Every image is anchored by a clear textual structure, ensuring thoughts are as enduring as the frames captured.
- **Minimalist Autonomy**: Built for the long haul. Content is stored via Markdown and object-based media to ensure zero platform lock-in.
- **Living Archive**: The project emphasizes accumulation over transient publishing, designed to be easily migrated or rebuilt decades from now.

## 🛠 Technical Overview

- **Framework**: Next.js (App Router)
- **Rendering**: Static-first, lightweight, and SEO-optimized.
- **Backend**: Optional/Decoupled. Content is driven by the local filesystem or S3-compatible storage.
- **Assets**: Media assets are managed outside the application runtime for maximum portability and CDN efficiency.

## 🤖 Future Direction: AI-Assisted Curation

The project experiments with **AI-assisted workflows** via MCP (Model Context Protocol). We view AI as a "creative companion" to augment human authorship:
- **Intelligent Organization**: Automated metadata generation and conceptual tagging.
- **Contextual Synthesis**: Writing support, summarization, and building non-linear connections across years of archives.
- **Visual Intelligence**: Assisting in the discovery of hidden patterns between urban and wild landscapes.

## 🚀 Development
```bash
## Boot with MCP dependencies (Chrome DevTools bridge) + Next.js
npm run dev

## Start a standard Next.js dev server without MCP
npm run dev:raw

# License
- Code: The source code is Open Source under the MIT License.
- Content: All rights reserved for all photographs and textual content. No unauthorized reproduction or usage.

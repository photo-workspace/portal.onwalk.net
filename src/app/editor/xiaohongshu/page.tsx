import '@modules/markdown-editor/app/globals.css'
import XiaohongshuMarkdownEditor from '@modules/markdown-editor/components/editor/xiaohongshu/XiaohongshuMarkdownEditor'
import { Toaster } from '@modules/markdown-editor/components/ui/toaster'

export default function XiaohongshuPage() {
  return (
    <main className="h-full bg-background flex flex-col">
      <div className="flex-1 relative">
        <XiaohongshuMarkdownEditor />
      </div>

      <Toaster />
    </main>
  )
}

'use client'

import { codeThemes, type CodeThemeId } from '@modules/markdown-editor/config/code-themes'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@modules/markdown-editor/components/ui/select'
import { Label } from '@modules/markdown-editor/components/ui/label'

interface CodeThemeSelectorProps {
  value: CodeThemeId
  onChange: (value: CodeThemeId) => void
}

export function CodeThemeSelector({ value, onChange }: CodeThemeSelectorProps) {
  return (
    <div className="flex items-center gap-4">
      <Label>代码主题</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="选择代码主题" />
        </SelectTrigger>
        <SelectContent>
          {codeThemes.map((theme) => (
            <SelectItem key={theme.id} value={theme.id}>
              {theme.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 
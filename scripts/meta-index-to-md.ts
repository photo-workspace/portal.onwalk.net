import { generateAllMarkdownFromMetaIndex, generateMarkdownFromMetaIndex } from './meta-index'

function parseTypeArg(): 'image' | 'video' | 'all' {
  const typeArgIndex = process.argv.findIndex((arg) => arg === '--type')
  if (typeArgIndex === -1) {
    return 'all'
  }
  const value = process.argv[typeArgIndex + 1]
  if (value === 'image' || value === 'video') {
    return value
  }
  return 'all'
}

async function main() {
  const type = parseTypeArg()

  if (type === 'all') {
    const result = await generateAllMarkdownFromMetaIndex()
    console.log(`Generated image markdown files: ${result.image.length}`)
    console.log(`Generated video markdown files: ${result.video.length}`)
    return
  }

  const written = await generateMarkdownFromMetaIndex(type)
  console.log(`Generated ${type} markdown files: ${written.length}`)
}

main().catch((error) => {
  console.error('Meta-index generation failed:', error)
  process.exit(1)
})

# Meta Index (批量维护入口)

这个目录用于**批量维护 Markdown 内容的元数据**，并通过脚本同步到 `src/content/<type>` 中。
Markdown 仍然是主数据源；meta-index 只是一个可选的批量入口。

## 推荐格式

每个 `*.yaml` / `*.yml` / `*.json` 文件包含一个 `items` 数组：

```yaml
items:
  - type: image
    slug: sample-image
    title_zh: "海边的胶片"
    title_en: "Seaside on Film"
    cover: "/images/cover/sample.jpg"
    equipment_zh: "Leica M6 + 35mm"
    equipment_en: "Leica M6 + 35mm"
    location_zh: "厦门"
    location_en: "Xiamen"
    content_zh: |
      这里是中文描述。
    content_en: |
      English description lives here.
```

## 双语字段约定

- 以 `*_zh` / `*_en` 成对保存双语字段。
- 脚本会把 `*_zh` 作为默认字段写回 Markdown（例如 `title`），并保留 `*_en`。

## 同步到 Markdown

运行脚本：

```bash
yarn tsx scripts/meta-index-to-md.ts
```

或作为 MCP tool 调用（见 `scripts/mcp-server.ts`）。

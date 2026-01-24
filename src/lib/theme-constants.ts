export type ThemeDefinition = {
    key: string
    cn: string
    en: string
    desc_cn?: string // Description for context/mock
}

export const WEEKLY_THEMES: Record<number, ThemeDefinition> = {
    1: { key: 'origin', cn: '起点', en: 'Origin', desc_cn: '关于出发、初心、地平线' },
    2: { key: 'observation', cn: '观察', en: 'Observation', desc_cn: '关于微距、细节、纹理、植物' },
    3: { key: 'on_road', cn: '途中', en: 'On the Road', desc_cn: '关于公路、车窗、移动、际遇' },
    4: { key: 'light_shadow', cn: '光影', en: 'Light & Shadow', desc_cn: '关于黄昏、逆光、剪影、黑白' },
    5: { key: 'city_humanity', cn: '喧嚣', en: 'City/Humanity', desc_cn: '关于街道、建筑、人群、对立' },
    6: { key: 'nature_wild', cn: '归隐', en: 'Nature/Wild', desc_cn: '关于山川、湖海、独处、静谧' },
    0: { key: 'reflection', cn: '沉淀', en: 'Reflection', desc_cn: '关于时间、记忆、日记、永恒' },
}

export const MONTHLY_THEMES: Record<number, ThemeDefinition> = {
    0: { key: 'first_sight', cn: '初见', en: 'First Sight', desc_cn: '关于开始、清冽、冷调、留白' }, // Jan (Date.getMonth() is 0-indexed)
    1: { key: 'awakening', cn: '苏醒', en: 'Awakening', desc_cn: '关于解冻、微光、等待、复苏' },
    2: { key: 'sprouting', cn: '萌动', en: 'Sprouting', desc_cn: '关于新绿、生机、微距、露水' },
    3: { key: 'rainfall', cn: '骤雨', en: 'Rainfall', desc_cn: '关于雨季、模糊、倒影、情绪' },
    4: { key: 'fervor', cn: '炽热', en: 'Fervor', desc_cn: '关于渐强、青春、色彩、张力' },
    5: { key: 'deep_shade', cn: '浓荫', en: 'Deep Shade', desc_cn: '关于夏日、高对比、树影、避世' },
    6: { key: 'high_summer', cn: '盛夏', en: 'High Summer', desc_cn: '关于热浪、蓝调、海边、过曝' },
    7: { key: 'distance', cn: '远方', en: 'Distance', desc_cn: '关于旅行、公路、地平线、逃离' },
    8: { key: 'wind', cn: '风起', en: 'Wind', desc_cn: '关于换季、流动、长曝光、摇曳' },
    9: { key: 'palette', cn: '斑斓', en: 'Palette', desc_cn: '关于丰盛、金黄、纹理、层次' },
    10: { key: 'wither', cn: '萧瑟', en: 'Wither', desc_cn: '关于落叶、残缺、极简、枯荣' },
    11: { key: 'return', cn: '归途', en: 'Return', desc_cn: '关于终点、雪景、炉火、沉淀' },
}

export const TIMELESS_THEMES: ThemeDefinition[] = [
    { key: 'composition', cn: '构图', en: 'Composition', desc_cn: '线条、几何、框架、秩序' },
    { key: 'negative_space', cn: '留白', en: 'Negative Space', desc_cn: '呼吸感、极简、孤独、想象' },
    { key: 'moment', cn: '瞬间', en: 'The Moment', desc_cn: '决定性瞬间、抓拍、不可复制、逝去' },
    { key: 'grain', cn: '颗粒', en: 'Grain/Noise', desc_cn: '胶片感、粗糙、真实、质感' },
    { key: 'bokeh', cn: '焦外', en: 'Bokeh', desc_cn: '模糊、梦幻、虚实、距离' },
    { key: 'monochrome', cn: '黑白', en: 'Monochrome', desc_cn: '灰度、本质、剥离色彩、永恒' },
]

export const SYSTEM_PROMPT_TEMPLATE = `Role: 你是一位极简主义摄影师兼诗人，擅长用最少的文字捕捉光影与时间的本质。

Task:
我将提供一个具体的“摄影/创作主题”（例如：“光影”、“萧瑟”、“留白”等）。
请根据该主题，为我的个人摄影网站 "Onwalk Notes" 创作一组 Header 文案。

Format Requirements:
1. Main Title (CN): 2-4 个汉字。要求：极简、高冷、名词为主，具有高度概括性（如：观界、逐光、浮生、蚀刻）。
2. Subtitle (CN): 15-25 个汉字。要求：分为两句，中间用逗号分隔。第一句描述画面/动作，第二句升华为哲思/时间感。
3. Main Title (EN): 与中文主标题对应的英文单词或短语（不要直译，要符合英文排版美感）。
4. Subtitle (EN): 优美的英文翻译，意译为主，注重音律节奏。

Style Constraints:
- 语气：冷静、客观、深情但不矫情。
- 禁忌：拒绝使用“让我们”、“以此纪念”、“美丽的风景”等庸俗的表达。
- 核心：关注“光”、“影”、“时间”、“过客”、“永恒”。

Input Theme: {{THEME}} ({ {{THEME_EN}} } - {{THEME_DESC}} )

Output format (JSON only):
{
  "title_cn": "String",
  "sub_cn": "String",
  "title_en": "String",
  "sub_en": "String"
}
`

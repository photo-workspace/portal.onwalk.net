import type { Language } from './language'

type OnwalkCopy = {
  header: {
    title: string
    nav: {
      home: string
      image: string
      video: string
      blog: string
      about: string
    }
  }
  footer: {
    tagline: string
    description: string
    socials: {
      twitter: string
      xiaohongshu: string
      wechat: string
      wechatQrAlt: string
      wechatQrHint: string
    }
  }
  home: {
    hero: {
      badge: string
      tagline: string
      title: string
      description: string
      chips: {
        featured: string
        moments: string
        theater: string
        journal: string
      }
    }
    sections: {
      blog: {
        title: string
        subtitle: string
      }
      image: {
        title: string
        subtitle: string
      }
      video: {
        title: string
        subtitle: string
      }
    }
  }
  about: {
    eyebrow: string
    title: string
    subtitle: string
    paragraphs: string[]
  }
  blog: {
    overview: {
      eyebrow: string
      title: string
      subtitle: string
    }
    categories: {
      tracks: string
      city: string
      scenery: string
    }
    sections: {
      tracks: {
        eyebrow: string
        title: string
        subtitle: string
      }
      city: {
        eyebrow: string
        title: string
        subtitle: string
      }
      scenery: {
        eyebrow: string
        title: string
        subtitle: string
      }
    }
    backLabel: string
  }
  image: {
    eyebrow: string
    title: string
    subtitle: string
    copyMarkdown: string
    markdownCopied: string
  }
  video: {
    eyebrow: string
    title: string
    subtitle: string
    empty: string
    pageLabel: string
    prev: string
    next: string
    copyMarkdown: string
    markdownCopied: string
  }
}

export const onwalkCopy: Record<Language, OnwalkCopy> = {
  zh: {
    header: {
      title: '行者影像',
      nav: {
        home: '首页',
        image: '瞬间',
        video: '影像',
        blog: '笔记',
        about: '关于',
      },
    },
    footer: {
      tagline: '影像为入口，文字为结构。记录个人多年的行走拍摄，文字与结构由 AI 协作整理。',
      description: '',
      socials: {
        twitter: 'X (Twitter)',
        xiaohongshu: '小红书',
        wechat: '微信',
        wechatQrAlt: '微信二维码',
        wechatQrHint: '微信扫码关注',
      },
    },
    home: {
      hero: {
        badge: 'Index',
        tagline: '影像为入口 · 文字为结构',
        title: '分享自然之美与旅程笔记',
        description: '捕捉光影的永恒之舞，通过镜头让转瞬即逝的时刻成为不朽。',
        chips: {
          featured: '影像聚合',
          moments: 'Moments',
          theater: 'Theater',
          journal: 'Journal',
        },
      },
      sections: {
        blog: {
          title: '笔记',
          subtitle: '影像为入口，文字为结构',
        },
        image: {
          title: '瞬间',
          subtitle: '胶片式浏览',
        },
        video: {
          title: '影像',
          subtitle: '沉浸式观看',
        },
      },
    },
    about: {
      eyebrow: '关于',
      title: '',
      subtitle: '写给自己，也写给对世间充满热爱且好奇的每一位过客。',
      paragraphs: [
        '我把影像当作一种长期的笔记。用镜头记录城市与山野的纹理，用文字为它们提供持续生长的结构。',
        '这不是一次性的项目，也不是为了完成而存在的作品集。它更像一份不断累积的档案：照片是入口，文字是脊梁；在漫长的行走与宏大的风景之间，记录那些比终点更重要的——属于个人的孤独、节奏与心境。',
        '这里所呈现的，是我在过去十余年里不断行走、停留、回望所留下的痕迹。它们不追求即时的回应，而更接近一种缓慢成形的记忆——既关于世界如何被看见，也关于我如何在时间中逐渐成为自己。',
      ],
    },
    blog: {
      overview: {
        eyebrow: '笔记',
        title: '以文字整理影像里的路径',
        subtitle: '深度阅读与影像观察共存的地方。',
      },
      categories: {
        tracks: '山野行踪',
        city: '城市漫游',
        scenery: '行者影像',
      },
      sections: {
        tracks: {
          eyebrow: '山野行踪',
          title: '影像优先的行摄记录',
          subtitle: '把山野的步调拆解成可回看的影像笔记。',
        },
        city: {
          eyebrow: '城市漫游',
          title: '以文字作为漫游的主线',
          subtitle: '让城市的光影成为文本的支点。',
        },
        scenery: {
          eyebrow: '行者影像',
          title: '影像先行的动态记录',
          subtitle: '用影像先行，再用文字收束。',
        },
      },
      backLabel: '← 返回笔记',
    },
    image: {
      eyebrow: '瞬间',
      title: '瞬息与永恒',
      subtitle: '在时间的缝隙里，截取光影的切片。',
      copyMarkdown: '复制 Markdown 链接',
      markdownCopied: 'Markdown 链接已复制',
    },
    video: {
      eyebrow: '影像',
      title: '静谧与流动',
      subtitle: '用影像的起伏，唤醒照片沉睡的节奏。',
      empty: '暂无视频',
      pageLabel: '页码',
      prev: '上一页',
      next: '下一页',
      copyMarkdown: '复制 Markdown 链接',
      markdownCopied: 'Markdown 链接已复制',
    },
  },
  en: {
    header: {
      title: 'Onwalk Notes',
      nav: {
        home: 'Home',
        image: 'Moments',
        video: 'Theater',
        blog: 'Journal',
        about: 'About',
      },
    },
    footer: {
      tagline: 'Images lead, words shape — personal journeys in walking and photography, refined with AI.',
      description: '',
      socials: {
        twitter: 'X (Twitter)',
        xiaohongshu: 'RED (Xiaohongshu)',
        wechat: 'WeChat',
        wechatQrAlt: 'WeChat QR code',
        wechatQrHint: 'Scan to follow on WeChat',
      },
    },
    home: {
      hero: {
        badge: 'Index',
        tagline: 'Images as the entry · Words as the structure',
        title: 'Sharing the Beauty of Nature & Journeys',
        description: 'Capturing the eternal dance of light and shadow, immortalizing the fleeting moment.',
        chips: {
          featured: 'Image Collection',
          moments: 'Moments',
          theater: 'Theater',
          journal: 'Journal',
        },
      },
      sections: {
        blog: {
          title: 'Photo Journal',
          subtitle: 'Images lead, words structure.',
        },
        image: {
          title: 'Moments',
          subtitle: 'Filmstrip browsing',
        },
        video: {
          title: 'Theater',
          subtitle: 'Immersive viewing',
        },
      },
    },
    about: {
      eyebrow: 'About',
      title: '',
      subtitle: 'Written for myself, and for every passerby who is full of love for the world and curiosity.',
      paragraphs: [
        'I treat images as a form of long-term notes. Through the lens, I record the textures of cities and landscapes; through words, I give them a structure that can continue to grow.',
        'This is not a one-off project, nor a portfolio built for completion. It is an archive in constant accumulation: photographs serve as entry points, text forms the spine. Between long walks and vast landscapes, it preserves what matters more than destinations—personal solitude, rhythm, and states of mind.',
        'What you see here is the trace of more than a decade of walking, pausing, and looking back. These works do not seek immediate response; they resemble memories slowly taking shape—about how the world is seen, and how I have gradually become myself over time.',
      ],
    },
    blog: {
      overview: {
        eyebrow: 'Photo Journal',
        title: 'Tracing paths in images with words',
        subtitle: 'Where deep reading and visual observation coexist.',
      },
      categories: {
        tracks: 'Wild Tracks',
        city: 'City Roaming',
        scenery: 'Journey Scenes',
      },
      sections: {
        tracks: {
          eyebrow: 'Wild Tracks',
          title: 'Image-first travel notes',
          subtitle: 'Break down the rhythm of the wild into revisitable visual notes.',
        },
        city: {
          eyebrow: 'City Roaming',
          title: 'Words guide the city wander',
          subtitle: 'Let urban light and shadow anchor the narrative.',
        },
        scenery: {
          eyebrow: 'Journey Scenes',
          title: 'Image-led moving records',
          subtitle: 'Let images lead, then let words gather the thread.',
        },
      },
      backLabel: '← Back to Photo Journal',
    },
    image: {
      eyebrow: 'Moments',
      title: 'Moments & Eternity',
      subtitle: 'Capturing slices of light in the crevices of time.',
      copyMarkdown: 'Copy Markdown Link',
      markdownCopied: 'Markdown Link Copied',
    },
    video: {
      eyebrow: 'Theater',
      title: 'Stillness & Flow',
      subtitle: 'Awaken the sleeping rhythm of the frame through the undulation of imagery.',
      empty: 'No video yet',
      pageLabel: 'Page',
      prev: 'Previous',
      next: 'Next',
      copyMarkdown: 'Copy Markdown Link',
      markdownCopied: 'Markdown Link Copied',
    },
  },
}

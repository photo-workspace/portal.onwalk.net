import type { Language } from './LanguageProvider'

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
  }
  video: {
    eyebrow: string
    title: string
    subtitle: string
    empty: string
  }
}

export const onwalkCopy: Record<Language, OnwalkCopy> = {
  zh: {
    header: {
      title: '行者影像档案',
      nav: {
        home: '首页',
        image: '一图一文',
        video: '一图一视频',
        blog: '行摄笔记',
        about: '关于',
      },
    },
    footer: {
      tagline: '行者影像与思想档案 · 影像为入口，文字为结构。',
      description: '影像与文字均来自个人行摄记录，持续更新。',
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
        title: '一个可长期生长的影像与思想档案',
        description: '记录城市与山野的影像实践，让每一段图像有清晰的文字骨架。',
        chips: {
          featured: '影像聚合',
          moments: 'Moments / Image',
          theater: 'Theater / Video',
          journal: 'Journal / Blog',
        },
      },
      sections: {
        blog: {
          title: '行摄笔记',
          subtitle: '影像为入口，文字为结构',
        },
        image: {
          title: '一图一文',
          subtitle: '胶片式浏览',
        },
        video: {
          title: '一图一视频',
          subtitle: '剧场式观看',
        },
      },
    },
    about: {
      eyebrow: '关于',
      title: '影像与方法论',
      subtitle: '写给未来的自己，也写给同行者。',
      paragraphs: [
        '我把影像当作一种长期笔记，用镜头记录城市与山野的纹理，并用文字给予它们持续生长的结构。',
        '这不是一次性的项目，而是可以长期积累的档案。照片是入口，文字是脊梁，愿它们一起陪我走得更远。',
      ],
    },
    blog: {
      overview: {
        eyebrow: '行摄笔记',
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
      backLabel: '← 返回行摄笔记',
    },
    image: {
      eyebrow: '一图一文',
      title: '以影像为入口的单页阅读',
      subtitle: '每一张照片对应一段文字，让图像延续成叙事。',
    },
    video: {
      eyebrow: '一图一视频',
      title: '影像剧场',
      subtitle: '通过短片补充照片的呼吸与节奏。',
      empty: '暂无视频',
    },
  },
  en: {
    header: {
      title: 'Onwalk Image Archive',
      nav: {
        home: 'Home',
        image: 'Moments / Image',
        video: 'Theater / Video',
        blog: 'Journal / Blog',
        about: 'About',
      },
    },
    footer: {
      tagline: 'Onwalk Image & Idea Archive · Images as the entry, words as the structure.',
      description: 'Images and words come from personal journeys, updated regularly.',
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
        title: 'A growing archive of images and ideas',
        description: 'Documenting visual journeys across cities and wilds, giving each image a clear textual frame.',
        chips: {
          featured: 'Image Collection',
          moments: 'Moments / Image',
          theater: 'Theater / Video',
          journal: 'Journal / Blog',
        },
      },
      sections: {
        blog: {
          title: 'Photo Journal',
          subtitle: 'Images lead, words structure.',
        },
        image: {
          title: 'Moments / Image',
          subtitle: 'Filmstrip browsing',
        },
        video: {
          title: 'Theater / Video',
          subtitle: 'Theater-style viewing',
        },
      },
    },
    about: {
      eyebrow: 'About',
      title: 'Images & Method',
      subtitle: 'Written for my future self and fellow travelers.',
      paragraphs: [
        'I treat images as long-term notes, recording the texture of cities and wilds with the lens, and letting words give them a lasting structure.',
        'This is not a one-off project but an archive that can keep growing. Photos are the entry, words the spine—may they take me farther.',
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
      eyebrow: 'Moments / Image',
      title: 'Single-page reading led by images',
      subtitle: 'Each photo pairs with a passage so images carry on the narrative.',
    },
    video: {
      eyebrow: 'Theater / Video',
      title: 'Image Theater',
      subtitle: 'Short films add breath and rhythm to the stills.',
      empty: 'No video yet',
    },
  },
}

// 应用配置管理
export const config = {
  // 数据库配置
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'warp_zone_gems',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.NODE_ENV === 'production',
    maxConnections: 20,
    idleTimeout: 30000,
    connectionTimeout: 2000,
  },

  // 应用配置
  app: {
    name: 'Warp Zone Gems',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000'),
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  },

  // 安全配置
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-key',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    sessionTimeout: 24 * 60 * 60 * 1000, // 24小时
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15分钟
  },

  // API 配置
  api: {
    siliconFlow: {
      baseUrl: process.env.SILICON_FLOW_BASE_URL || 'https://api.siliconflow.cn/v1',
      defaultModel: 'Qwen/Qwen2.5-7B-Instruct',
      timeout: 30000,
    },
    imgbb: {
      baseUrl: 'https://api.imgbb.com/1/upload',
      timeout: 10000,
    },
  },

  // 文件上传配置
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    uploadDir: process.env.UPLOAD_DIR || './uploads',
  },

  // 缓存配置
  cache: {
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      ttl: parseInt(process.env.CACHE_TTL || '3600'), // 1小时
    },
    memory: {
      max: 1000,
      ttl: 5 * 60 * 1000, // 5分钟
    },
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    file: process.env.LOG_FILE || './logs/app.log',
    maxSize: '10m',
    maxFiles: 5,
  },

  // 功能开关
  features: {
    registration: process.env.ENABLE_REGISTRATION !== 'false',
    aiGeneration: process.env.ENABLE_AI_GENERATION !== 'false',
    hideContent: process.env.ENABLE_HIDE_CONTENT !== 'false',
    comments: process.env.ENABLE_COMMENTS !== 'false',
    ratings: process.env.ENABLE_RATINGS !== 'false',
    favorites: process.env.ENABLE_FAVORITES !== 'false',
  },

  // 分页配置
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
    defaultOffset: 0,
  },

  // 搜索配置
  search: {
    minQueryLength: 2,
    maxResults: 50,
    highlightLength: 200,
  },
};

// 配置验证
export function validateConfig() {
  const required = [
    'database.host',
    'database.port',
    'database.name',
    'database.user',
    'security.jwtSecret',
  ];

  const missing = required.filter(key => {
    const value = key.split('.').reduce((obj, k) => obj?.[k], config);
    return !value;
  });

  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }
}

// 获取配置值的辅助函数
export function getConfig<T>(path: string, defaultValue?: T): T {
  const value = path.split('.').reduce((obj, key) => obj?.[key], config);
  return value !== undefined ? value : defaultValue;
}

// 检查功能是否启用
export function isFeatureEnabled(feature: keyof typeof config.features): boolean {
  return config.features[feature] === true;
}

export default config;
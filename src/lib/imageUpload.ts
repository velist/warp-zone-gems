// 图片上传工具函数
// 使用 imgbb 免费图床服务

const IMGBB_API_KEY = '7c9e2e7a5c5f5e8a9d0e4f1c6b3a8b7c'; // 请替换为您的API密钥

export interface UploadResponse {
  success: boolean;
  data?: {
    url: string;
    delete_url: string;
    display_url: string;
  };
  error?: string;
}

export const uploadImage = async (file: File): Promise<UploadResponse> => {
  try {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      return { success: false, error: '请上传图片文件' };
    }

    // 检查文件大小 (16MB 限制)
    if (file.size > 16 * 1024 * 1024) {
      return { success: false, error: '图片大小不能超过 16MB' };
    }

    // 创建 FormData
    const formData = new FormData();
    formData.append('image', file);

    // 上传到 imgbb
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      return { success: false, error: '上传失败，请稍后重试' };
    }

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        data: {
          url: result.data.url,
          delete_url: result.data.delete_url,
          display_url: result.data.display_url,
        },
      };
    } else {
      return { success: false, error: result.error?.message || '上传失败' };
    }
  } catch (error) {
    console.error('图片上传错误:', error);
    return { success: false, error: '网络错误，请稍后重试' };
  }
};

// 使用其他免费图床的备选方案
export const uploadToImgur = async (file: File): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': 'Client-ID YOUR_IMGUR_CLIENT_ID', // 需要替换
      },
      body: formData,
    });

    if (!response.ok) {
      return { success: false, error: '上传失败，请稍后重试' };
    }

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        data: {
          url: result.data.link,
          delete_url: result.data.deletehash,
          display_url: result.data.link,
        },
      };
    } else {
      return { success: false, error: '上传失败' };
    }
  } catch (error) {
    console.error('图片上传错误:', error);
    return { success: false, error: '网络错误，请稍后重试' };
  }
};

// 免费图床选项配置
export const IMAGE_HOSTS = {
  imgbb: {
    name: 'ImgBB',
    upload: uploadImage,
    maxSize: 16, // MB
    note: '免费，稳定，16MB限制',
  },
  imgur: {
    name: 'Imgur',
    upload: uploadToImgur,
    maxSize: 10, // MB
    note: '免费，需要注册获取Client ID',
  },
} as const;
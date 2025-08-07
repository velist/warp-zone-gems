import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useParams } from 'react-router-dom';
import SimpleCoverUpload from '@/components/SimpleCoverUpload';
import RichTextEditor from '@/components/RichTextEditor';
import AIGameGenerator from '@/components/AIGameGenerator';
import FloatingActionPanel from '@/components/FloatingActionPanel';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface PostFormData {
  title: string;
  description: string;
  content: string;
  cover_image: string;
  category: string;
  tags: string[];
  author: string;
  download_link?: string;
}

const PostEditor = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    description: '',
    content: '',
    cover_image: '',
    category: '',
    tags: [],
    author: user?.email || '',
    download_link: ''
  });

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchPost();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        setError(error.message);
      } else {
        setCategories(data || []);
      }
    } catch (err) {
      setError('获取分类失败');
    }
  };

  const fetchPost = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setError(error.message);
      } else if (data) {
        setFormData({
          title: data.title || '',
          description: data.description || '',
          content: data.content || '',
          cover_image: data.cover_image || '',
          category: data.category || '',
          tags: data.tags || [],
          author: data.author || '',
          download_link: data.download_link || ''
        });
      }
    } catch (err) {
      setError('获取内容失败');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof PostFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, cover_image: url }));
  };

  const handleAIGenerate = (aiData: {
    title: string;
    description: string;
    content: string;
    tags: string[];
    category: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      title: aiData.title,
      description: aiData.description,
      content: aiData.content,
      tags: aiData.tags,
      category: aiData.category
    }));
    setShowAIGenerator(false);
  };

  const showAIGeneratorModal = () => {
    setShowAIGenerator(true);
  };

  const handleSave = async (isDraft = false) => {
    if (!formData.title.trim()) {
      setError('请输入标题');
      return;
    }

    if (!formData.category) {
      setError('请选择分类');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const postData = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        cover_image: formData.cover_image,
        category: formData.category,
        tags: formData.tags,
        author: formData.author,
        download_link: formData.download_link,
        published_at: isDraft ? null : new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (isEditing) {
        const { error } = await supabase
          .from('games')
          .update(postData)
          .eq('id', id);

        if (error) {
          setError(error.message);
        } else {
          alert(isDraft ? '草稿保存成功！' : '发布成功！');
          navigate('/admin/posts');
        }
      } else {
        const { error } = await supabase
          .from('games')
          .insert([postData]);

        if (error) {
          setError(error.message);
        } else {
          alert(isDraft ? '草稿保存成功！' : '发布成功！');
          navigate('/admin/posts');
        }
      }
    } catch (err) {
      setError('保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        {/* 主要内容区域 */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border p-6 space-y-8">
            
            {/* 页面标题 */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {isEditing ? '编辑内容' : '创建新内容'}
              </h1>
              <p className="text-gray-600">使用AI智能生成或手动创建游戏资源内容</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 标题和分类并排 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="title" className="text-base font-medium">游戏标题 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="输入游戏标题..."
                  className="mt-2 h-12 text-base"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-base font-medium">游戏分类 *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="mt-2 h-12 text-base">
                    <SelectValue placeholder="选择游戏分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 封面图片 */}
            <div>
              <Label className="text-base font-medium block mb-4">封面图片</Label>
              <SimpleCoverUpload
                onImageUpload={handleImageUpload}
                value={formData.cover_image}
              />
            </div>

            {/* 富文本编辑器 */}
            <div>
              <Label className="text-base font-medium block mb-4">游戏详细介绍</Label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => handleInputChange('content', value)}
                placeholder="详细描述游戏内容、特色、玩法、背景故事等..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* 悬浮操作面板 */}
      <FloatingActionPanel
        onSave={handleSave}
        onBack={() => navigate('/admin/posts')}
        onAIGenerate={showAIGeneratorModal}
        saving={saving}
        aiGenerating={aiGenerating}
        position="right"
      />

      {/* AI生成器模态框 */}
      {showAIGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-white rounded-lg p-6">
              <AIGameGenerator onGenerate={handleAIGenerate} />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setShowAIGenerator(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostEditor;
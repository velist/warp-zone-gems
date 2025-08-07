import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadImage, UploadResponse } from "@/lib/imageUpload";
import { Upload, X, Image as ImageIcon, Link, Copy } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  value?: string;
  className?: string;
}

const ImageUpload = ({ onImageUpload, value, className }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState(value || '');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file) return;

    setUploading(true);
    setError('');

    uploadImage(file).then((response: UploadResponse) => {
      if (response.success && response.data) {
        onImageUpload(response.data.url);
        setUrlInput(response.data.url);
      } else {
        setError(response.error || '上传失败');
      }
      setUploading(false);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    } else {
      setError('请拖放图片文件');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onImageUpload(urlInput.trim());
      setError('');
    }
  };

  const clearImage = () => {
    setUrlInput('');
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copyUrl = async () => {
    if (urlInput) {
      try {
        await navigator.clipboard.writeText(urlInput);
      } catch (err) {
        console.error('复制失败:', err);
      }
    }
  };

  return (
    <div className={className}>
      <Label className="text-sm font-medium">封面图片</Label>
      
      {/* 上传模式选择 */}
      <div className="flex space-x-2 mb-4">
        <Button
          type="button"
          variant={uploadMode === 'file' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUploadMode('file')}
        >
          <Upload className="h-4 w-4 mr-1" />
          上传文件
        </Button>
        <Button
          type="button"
          variant={uploadMode === 'url' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUploadMode('url')}
        >
          <Link className="h-4 w-4 mr-1" />
          图片链接
        </Button>
      </div>

      {uploadMode === 'file' ? (
        <Card
          className={`border-2 border-dashed transition-colors ${
            dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
          } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CardContent className="p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            {urlInput ? (
              <div className="space-y-4">
                <img
                  src={urlInput}
                  alt="上传的图片"
                  className="max-h-48 mx-auto rounded border"
                />
                <div className="flex justify-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copyUrl}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    复制链接
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearImage}
                  >
                    <X className="h-4 w-4 mr-1" />
                    移除
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-gray-600">拖放图片文件到这里，或者</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? '上传中...' : '选择文件'}
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  支持 PNG、JPG、GIF 格式，最大 16MB
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
            <Button
              type="button"
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim()}
            >
              确认
            </Button>
            {urlInput && (
              <Button
                type="button"
                variant="outline"
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {urlInput && (
            <img
              src={urlInput}
              alt="预览图片"
              className="max-h-48 rounded border"
              onError={() => setError('图片链接无法访问')}
            />
          )}
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ImageUpload;
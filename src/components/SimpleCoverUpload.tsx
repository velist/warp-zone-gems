import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { uploadImage, UploadResponse } from "@/lib/imageUpload";
import { Image, Upload, X } from 'lucide-react';

interface SimpleCoverUploadProps {
  onImageUpload: (url: string) => void;
  value?: string;
}

const SimpleCoverUpload: React.FC<SimpleCoverUploadProps> = ({
  onImageUpload,
  value
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (file: File) => {
    if (!file) return;

    setUploading(true);
    setError('');

    uploadImage(file).then((response: UploadResponse) => {
      if (response.success && response.data) {
        onImageUpload(response.data.url);
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

  const clearImage = () => {
    onImageUpload('');
    setError('');
  };

  return (
    <div className="flex items-center space-x-4">
      {/* 上传按钮 */}
      <div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          id="cover-upload"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('cover-upload')?.click()}
          disabled={uploading}
          className="flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>{uploading ? '上传中...' : '选择封面'}</span>
        </Button>
      </div>

      {/* 图片预览 */}
      {value && (
        <div className="relative">
          <img
            src={value}
            alt="封面预览"
            className="w-20 h-20 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
            onClick={clearImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* 占位符 */}
      {!value && !uploading && (
        <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <Image className="h-8 w-8 text-gray-400" />
        </div>
      )}

      {/* 错误信息 */}
      {error && (
        <Alert variant="destructive" className="max-w-xs">
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SimpleCoverUpload;
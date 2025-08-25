import React from 'react';

const bannerImages = [
  '/placeholder.svg', // 替换为实际的Banner图片URL
  // 可以添加更多Banner图片
];

export const CommercialBanner: React.FC = () => {
  return (
    <div className="space-y-4">
      {bannerImages.map((imageUrl, index) => (
        <div key={index} className="overflow-hidden rounded-lg">
          <img
            src={imageUrl}
            alt=""
            className="w-full h-48 md:h-64 lg:h-80 object-cover"
          />
        </div>
      ))}
    </div>
  );
};
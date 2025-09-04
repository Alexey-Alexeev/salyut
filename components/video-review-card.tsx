'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

interface VideoReview {
  id: string;
  customer_name: string;
  video_url: string;
  thumbnail_url?: string;
}

interface VideoReviewCardProps {
  video: VideoReview;
}

export function VideoReviewCard({ video }: VideoReviewCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <Card className="overflow-hidden group cursor-pointer">
      <div className="aspect-video relative">
        {!isPlaying ? (
          // Превью с кнопкой play
          <>
            <Image
              src={video.thumbnail_url || '/default-thumbnail.jpg'}
              alt={video.customer_name}
              fill
              className="object-cover"
              onClick={handlePlay}
            />
            <div
              className="absolute inset-0 bg-black/30 flex items-center justify-center"
              onClick={handlePlay}
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1" />
              </div>
            </div>
          </>
        ) : (
          // Iframe с видео
          <iframe
            src={`${video.video_url}&autoplay=1`}
            className="w-full h-full"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            frameBorder="0"
          />
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2">Отзыв от {video.customer_name}</h3>
      </CardContent>
    </Card>
  );
}

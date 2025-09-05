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
    <Card className="group cursor-pointer overflow-hidden">
      <div className="relative aspect-video">
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
              className="absolute inset-0 flex items-center justify-center bg-black/30"
              onClick={handlePlay}
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <div className="ml-1 size-0 border-y-[8px] border-l-[12px] border-y-transparent border-l-white" />
              </div>
            </div>
          </>
        ) : (
          // Iframe с видео
          <iframe
            src={`${video.video_url}&autoplay=1`}
            className="size-full"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            frameBorder="0"
          />
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="mb-2 font-semibold">Отзыв от {video.customer_name}</h3>
      </CardContent>
    </Card>
  );
}

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

type VideoPlatform = 'rutube' | 'vk' | 'youtube' | 'unknown';

interface VideoInfo {
  platform: VideoPlatform;
  videoId: string | null;
  embedUrl: string | null;
}

function getVideoInfo(url: string): VideoInfo {
  if (!url) return { platform: 'unknown', videoId: null, embedUrl: null };

  // Rutube
  const rutubePatterns = [
    /rutube\.ru\/video\/([a-zA-Z0-9]+)(?:\/.*)?/,
    /rutube\.ru\/play\/embed\/([a-zA-Z0-9]+)(?:\/.*)?/,
    /rutube\.ru\/video\/private\/([a-zA-Z0-9]+)(?:\/.*)?/
  ];

  for (const pattern of rutubePatterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        platform: 'rutube',
        videoId: match[1],
        embedUrl: `https://rutube.ru/play/embed/${match[1]}`
      };
    }
  }

  // VK Video
  const vkPatterns = [
    /vk\.com\/video(-?\d+_\d+)/,
    /vkvideo\.ru\/video(-?\d+_\d+)/,
    /vk\.com\/video\?z=video(-?\d+_\d+)/
  ];

  for (const pattern of vkPatterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        platform: 'vk',
        videoId: match[1],
        embedUrl: `https://vk.com/video_ext.php?oid=${match[1].split('_')[0]}&id=${match[1].split('_')[1]}&hd=2`
      };
    }
  }

  // YouTube
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        platform: 'youtube',
        videoId: match[1],
        embedUrl: `https://www.youtube.com/embed/${match[1]}`
      };
    }
  }

  return { platform: 'unknown', videoId: null, embedUrl: null };
}

export function VideoReviewCard({ video }: VideoReviewCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const videoInfo = getVideoInfo(video.video_url);

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
          videoInfo.embedUrl ? (
            <iframe
              src={videoInfo.embedUrl}
              className="size-full"
              allow="clipboard-write; autoplay"
              allowFullScreen
              frameBorder="0"
              style={{ border: 'none' }}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-8 text-center">
              <div className="mb-4 text-6xl opacity-50">🎬</div>
              <div className="text-lg font-medium text-gray-600 line-clamp-3">
                Отзыв от {video.customer_name}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Видео недоступно
              </div>
            </div>
          )
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="mb-2 font-semibold">Отзыв от {video.customer_name}</h3>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { type BadgeData, type BadgeStyle, type BadgeTheme } from '@/types/badges';

interface BadgePreviewProps {
  address: string;
  style: BadgeStyle;
  theme: BadgeTheme;
  showBadges: boolean;
  showLink: boolean;
}

export function BadgePreview({ 
  address, 
  style, 
  theme, 
  showBadges, 
  showLink 
}: BadgePreviewProps) {
  const [widgetHTML, setWidgetHTML] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWidget = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          style,
          theme,
          showBadges: showBadges.toString(),
          showLink: showLink.toString(),
        });

        const response = await fetch(
          `/api/widget/${address}?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch widget: ${response.statusText}`);
        }

        const html = await response.text();
        setWidgetHTML(html);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load widget');
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      fetchWidget();
    }
  }, [address, style, theme, showBadges, showLink]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-2">⚠️ Error</div>
        <div className="text-gray-400 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div dangerouslySetInnerHTML={{ __html: widgetHTML }} />
    </div>
  );
}

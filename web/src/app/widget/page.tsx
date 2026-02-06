'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BadgePreview } from '@/components/BadgePreview';
import { type BadgeStyle, type BadgeTheme } from '@/types/badges';
import { generateWidgetScript } from '@/lib/badge-utils';

export default function WidgetGeneratorPage() {
  const [address, setAddress] = useState('0x7f2d21d5d0e8317bbc935c12c49d0c0f3ac93856');
  const [style, setStyle] = useState<BadgeStyle>('standard');
  const [theme, setTheme] = useState<BadgeTheme>('dark');
  const [showBadges, setShowBadges] = useState(true);
  const [showLink, setShowLink] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const embedCode = generateWidgetScript(address, style, theme, showBadges, showLink);

  const iframeEmbed = `<iframe 
  src="https://paylobster.com/api/widget/${address}?style=${style}&theme=${theme}&showBadges=${showBadges}&showLink=${showLink}"
  width="${style === 'minimal' ? '200' : style === 'standard' ? '280' : '360'}"
  height="${style === 'minimal' ? '120' : style === 'standard' ? '240' : '320'}"
  frameborder="0"
  style="border: none; overflow: hidden;"
></iframe>`;

  const markdownEmbed = `![LOBSTER Score](https://paylobster.com/api/badge/${address}?format=svg)`;

  return (
    <div className="min-h-screen py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Widget Generator
          </h1>
          <p className="text-gray-400 text-lg">
            Create embeddable trust widgets for your website, blog, or documentation.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-bold mb-6">Configuration</h2>
              
              <div className="space-y-6">
                {/* Address Input */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Wallet Address
                  </label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your Pay Lobster registered wallet address
                  </p>
                </div>

                {/* Style Selector */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Widget Style
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['minimal', 'standard', 'full'] as BadgeStyle[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setStyle(s)}
                        className={`
                          px-4 py-3 rounded-lg border-2 transition-all
                          ${style === s
                            ? 'border-orange-600 bg-orange-600/10 text-white'
                            : 'border-zinc-800 bg-zinc-900 text-gray-400 hover:border-zinc-700'
                          }
                        `}
                      >
                        <div className="font-medium capitalize">{s}</div>
                        <div className="text-xs mt-1">
                          {s === 'minimal' && '200px'}
                          {s === 'standard' && '280px'}
                          {s === 'full' && '360px'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Selector */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Color Theme
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['dark', 'light'] as BadgeTheme[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`
                          px-4 py-3 rounded-lg border-2 transition-all
                          ${theme === t
                            ? 'border-orange-600 bg-orange-600/10 text-white'
                            : 'border-zinc-800 bg-zinc-900 text-gray-400 hover:border-zinc-700'
                          }
                        `}
                      >
                        <div className="font-medium capitalize">{t}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Options
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBadges}
                      onChange={(e) => setShowBadges(e.target.checked)}
                      className="w-4 h-4 text-orange-600 bg-zinc-900 border-zinc-700 rounded focus:ring-orange-600"
                    />
                    <div>
                      <div className="text-white">Show Badges</div>
                      <div className="text-xs text-gray-500">Display verification badges</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showLink}
                      onChange={(e) => setShowLink(e.target.checked)}
                      className="w-4 h-4 text-orange-600 bg-zinc-900 border-zinc-700 rounded focus:ring-orange-600"
                    />
                    <div>
                      <div className="text-white">Show Profile Link</div>
                      <div className="text-xs text-gray-500">Link to Pay Lobster profile</div>
                    </div>
                  </label>
                </div>
              </div>
            </Card>

            {/* Quick Links */}
            <Card className="bg-gradient-to-br from-orange-600/10 to-orange-600/5 border-orange-600/20">
              <h3 className="text-lg font-semibold mb-3">💡 Pro Tips</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">•</span>
                  <span>Use <strong>minimal</strong> style for sidebars and footers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">•</span>
                  <span>Use <strong>full</strong> style to showcase all your achievements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">•</span>
                  <span>Match the theme to your website's color scheme</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 mt-0.5">•</span>
                  <span>Widget updates automatically when your score changes</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Preview & Code Panel */}
          <div className="space-y-6">
            {/* Live Preview */}
            <Card>
              <h2 className="text-xl font-bold mb-6">Live Preview</h2>
              <div 
                className={`
                  rounded-lg border-2 
                  ${theme === 'dark' 
                    ? 'bg-zinc-950 border-zinc-800' 
                    : 'bg-white border-gray-200'
                  }
                `}
              >
                <BadgePreview
                  address={address}
                  style={style}
                  theme={theme}
                  showBadges={showBadges}
                  showLink={showLink}
                />
              </div>
            </Card>

            {/* Embed Code Tabs */}
            <Card>
              <h2 className="text-xl font-bold mb-6">Embed Code</h2>
              
              <div className="space-y-4">
                {/* JavaScript Embed */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-300">JavaScript Embed (Recommended)</h3>
                    <Button
                      onClick={() => handleCopy(embedCode)}
                      variant="secondary"
                      size="sm"
                    >
                      {copied ? '✓ Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                      <code>{embedCode}</code>
                    </pre>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Paste this code anywhere in your HTML. Widget loads asynchronously.
                  </p>
                </div>

                {/* iFrame Embed */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-300">iFrame Embed</h3>
                    <Button
                      onClick={() => handleCopy(iframeEmbed)}
                      variant="secondary"
                      size="sm"
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                      <code>{iframeEmbed}</code>
                    </pre>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Use for platforms that don't support custom JavaScript.
                  </p>
                </div>

                {/* Markdown (for docs/README) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-300">Markdown Badge (GitHub)</h3>
                    <Button
                      onClick={() => handleCopy(markdownEmbed)}
                      variant="secondary"
                      size="sm"
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                      <code>{markdownEmbed}</code>
                    </pre>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Perfect for GitHub READMEs and documentation sites.
                  </p>
                </div>
              </div>
            </Card>

            {/* API Reference */}
            <Card className="bg-zinc-900/50">
              <h3 className="text-lg font-semibold mb-3">🔗 API Reference</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-400">Widget API:</span>{' '}
                  <code className="text-orange-600 text-xs">
                    GET /api/widget/[address]
                  </code>
                </div>
                <div>
                  <span className="text-gray-400">Badge API:</span>{' '}
                  <code className="text-orange-600 text-xs">
                    GET /api/badge/[address]
                  </code>
                </div>
                <div className="pt-2">
                  <a 
                    href="/docs/widget" 
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    View full documentation →
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

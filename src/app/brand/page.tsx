'use client';

import { notFound } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  colors,
  coverageColors,
  shadows,
  radii,
  spacing,
  typography,
} from '@/lib/brand';

const ColorSwatch = ({
  color,
  name,
  description,
}: {
  color: string;
  name: string;
  description?: string;
}) => (
  <div className="flex flex-col items-center space-y-2">
    <div
      className="w-16 h-16 rounded-lg border border-gray-200 shadow-sm"
      style={{ backgroundColor: color }}
    />
    <div className="text-center">
      <div className="text-sm font-medium text-gray-900">{name}</div>
      <div className="text-xs text-gray-500 font-mono">{color}</div>
      {description && (
        <div className="text-xs text-gray-600 mt-1">{description}</div>
      )}
    </div>
  </div>
);

const TypeScale = ({
  title,
  config,
  example,
}: {
  title: string;
  config: { size: string; lineHeight: string; fontWeight: string };
  example: string;
}) => (
  <div className="space-y-2">
    <div className="text-sm font-medium text-gray-700">{title}</div>
    <div
      className="font-inter"
      style={{
        fontSize: config.size,
        lineHeight: config.lineHeight,
        fontWeight: config.fontWeight,
      }}
    >
      {example}
    </div>
    <div className="text-xs text-gray-500 font-mono">
      {config.size} / {config.lineHeight} / {config.fontWeight}
    </div>
  </div>
);

const ShadowExample = ({ shadow, name }: { shadow: string; name: string }) => (
  <div className="space-y-2">
    <div className="text-sm font-medium text-gray-700">{name}</div>
    <div
      className="w-24 h-16 bg-white rounded-lg border border-gray-100"
      style={{ boxShadow: shadow }}
    />
    <div className="text-xs text-gray-500 font-mono text-wrap break-all">
      {shadow}
    </div>
  </div>
);

const SpacingExample = ({ space, name }: { space: string; name: string }) => (
  <div className="space-y-2">
    <div className="text-sm font-medium text-gray-700">{name}</div>
    <div className="flex items-center space-x-2">
      <div
        className="bg-blue-200 rounded"
        style={{ width: space, height: space }}
      />
      <span className="text-xs text-gray-500 font-mono">{space}</span>
    </div>
  </div>
);

export default function BrandPage() {
  // Hide brand page in production
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-white">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Camp Work Brand System
          </h1>
          <p className="text-lg text-gray-600">
            Living style guide und Design-System
          </p>
        </div>

        <div className="space-y-16">
          {/* Logo Variants */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Logo-Varianten
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Light Theme */}
              <Card
                className="p-6"
                style={{ backgroundColor: colors.text.backgroundWhite }}
              >
                <CardHeader>
                  <CardTitle>Light Theme</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <span className="text-sm font-medium">Full (xl)</span>
                      <Logo variant="full" size="xl" theme="light" />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span className="text-sm font-medium">Full (lg)</span>
                      <Logo variant="full" size="lg" theme="light" />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span className="text-sm font-medium">Icon only</span>
                      <Logo variant="icon" size="lg" theme="light" />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span className="text-sm font-medium">Wordmark only</span>
                      <Logo variant="wordmark" size="lg" theme="light" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dark Theme */}
              <Card
                className="p-6"
                style={{ backgroundColor: colors.text.primary }}
              >
                <CardHeader>
                  <CardTitle className="text-white">Dark Theme</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <span className="text-sm font-medium text-gray-300">
                        Full (xl)
                      </span>
                      <Logo variant="full" size="xl" theme="dark" />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span className="text-sm font-medium text-gray-300">
                        Full (lg)
                      </span>
                      <Logo variant="full" size="lg" theme="dark" />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span className="text-sm font-medium text-gray-300">
                        Icon only
                      </span>
                      <Logo variant="icon" size="lg" theme="dark" />
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span className="text-sm font-medium text-gray-300">
                        Wordmark only
                      </span>
                      <Logo variant="wordmark" size="lg" theme="dark" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Color Palette */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Farbpalette
            </h2>

            {/* Primary Colors */}
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Primärfarben
                </h3>
                <div className="flex flex-wrap gap-6">
                  <ColorSwatch
                    color={colors.primary.warmGold}
                    name="Warm Gold"
                    description="CTAs, Akzente"
                  />
                  <ColorSwatch
                    color={colors.primary.cream}
                    name="Cream"
                    description="Backgrounds, Cards"
                  />
                  <ColorSwatch
                    color={colors.primary.skyBlue}
                    name="Sky Blue"
                    description="Sekundäre Elemente"
                  />
                </div>
              </div>

              {/* Extended Colors */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Erweiterte Palette
                </h3>
                <div className="flex flex-wrap gap-6">
                  <ColorSwatch
                    color={colors.extended.goldDark}
                    name="Gold Dark"
                    description="Hover States"
                  />
                  <ColorSwatch
                    color={colors.extended.goldLight}
                    name="Gold Light"
                    description="Highlights"
                  />
                  <ColorSwatch
                    color={colors.extended.skyBlueDark}
                    name="Sky Blue Dark"
                    description="Link Hover"
                  />
                  <ColorSwatch
                    color={colors.extended.skyBlueLight}
                    name="Sky Blue Light"
                    description="Info Backgrounds"
                  />
                  <ColorSwatch
                    color={colors.extended.creamDark}
                    name="Cream Dark"
                    description="Borders"
                  />
                  <ColorSwatch
                    color={colors.extended.border}
                    name="Border"
                    description="Card Borders"
                  />
                </div>
              </div>

              {/* Text Colors */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Text-Farben
                </h3>
                <div className="flex flex-wrap gap-6">
                  <ColorSwatch
                    color={colors.text.primary}
                    name="Primary Text"
                    description="Überschriften"
                  />
                  <ColorSwatch
                    color={colors.text.secondary}
                    name="Secondary Text"
                    description="Body Text"
                  />
                  <ColorSwatch
                    color={colors.text.backgroundWhite}
                    name="Background White"
                    description="Haupt-Hintergrund"
                  />
                </div>
              </div>

              {/* Coverage Colors */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Netzabdeckung
                </h3>
                <div className="flex flex-wrap gap-6">
                  {Object.entries(coverageColors).map(([key, config]) => (
                    <ColorSwatch
                      key={key}
                      color={config.hex}
                      name={config.label}
                      description={config.description}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Typography */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Typografie
            </h2>
            <Card className="p-6">
              <CardContent className="space-y-6">
                <TypeScale
                  title="Display"
                  config={typography.fontSize.display}
                  example="Camping mit perfektem Netz"
                />
                <TypeScale
                  title="Headline 1"
                  config={typography.fontSize.h1}
                  example="Finde deinen perfekten Platz"
                />
                <TypeScale
                  title="Headline 2"
                  config={typography.fontSize.h2}
                  example="Zuverlässige Netzabdeckung"
                />
                <TypeScale
                  title="Headline 3"
                  config={typography.fontSize.h3}
                  example="Für digitale Nomaden"
                />
                <TypeScale
                  title="Body Text"
                  config={typography.fontSize.body}
                  example="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                />
                <TypeScale
                  title="Caption"
                  config={typography.fontSize.caption}
                  example="Letzte Aktualisierung: vor 2 Stunden"
                />
              </CardContent>
            </Card>
          </section>

          {/* Buttons */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Buttons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Button Varianten</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <Button
                      style={{ backgroundColor: colors.primary.warmGold }}
                    >
                      Primary Button
                    </Button>
                    <Button
                      variant="secondary"
                      style={{ backgroundColor: colors.primary.cream }}
                    >
                      Secondary
                    </Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      size="sm"
                      style={{ backgroundColor: colors.primary.warmGold }}
                    >
                      Small
                    </Button>
                    <Button
                      style={{ backgroundColor: colors.primary.warmGold }}
                    >
                      Default
                    </Button>
                    <Button
                      size="lg"
                      style={{ backgroundColor: colors.primary.warmGold }}
                    >
                      Large
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Coverage Badges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(coverageColors).map(([key, config]) => (
                      <Badge
                        key={key}
                        variant="outline"
                        style={{
                          backgroundColor: `${config.hex}10`,
                          color: config.hex,
                          borderColor: `${config.hex}33`,
                        }}
                      >
                        {config.label}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Cards */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-4" style={{ boxShadow: shadows.card }}>
                <CardHeader>
                  <CardTitle>Campingplatz Beispiel</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-3">
                    Wunderschöner Platz am See mit exzellenter LTE-Abdeckung.
                  </p>
                  <div className="flex gap-2 mb-3">
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: `${colors.coverage.excellent}10`,
                        color: colors.coverage.excellent,
                        borderColor: `${colors.coverage.excellent}33`,
                      }}
                    >
                      5G
                    </Badge>
                    <Badge variant="secondary">WiFi</Badge>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    style={{ backgroundColor: colors.primary.warmGold }}
                  >
                    Details anzeigen
                  </Button>
                </CardContent>
              </Card>

              <Card
                className="p-4 hover:scale-105 transition-transform cursor-pointer"
                style={{ boxShadow: shadows.cardHover }}
              >
                <CardHeader>
                  <CardTitle>Mit Hover Effect</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Diese Card zeigt den Hover-Schatten.
                  </p>
                </CardContent>
              </Card>

              <Card
                className="p-4"
                style={{
                  backgroundColor: colors.primary.cream,
                  border: `1px solid ${colors.extended.creamDark}`,
                }}
              >
                <CardHeader>
                  <CardTitle>Cream Background</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Alternative Card mit Cream Hintergrund.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Shadows */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Schatten
            </h2>
            <div className="flex flex-wrap gap-8">
              {Object.entries(shadows).map(([name, shadow]) => (
                <ShadowExample key={name} shadow={shadow} name={name} />
              ))}
            </div>
          </section>

          {/* Spacing & Radii */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Spacing & Border Radius
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Spacing (4px Base Grid)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(spacing).map(([name, space]) => (
                      <SpacingExample key={name} space={space} name={name} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Border Radius</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(radii).map(([name, radius]) => (
                    <div key={name} className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">
                        {name}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-16 h-12 bg-blue-200 border border-blue-300"
                          style={{ borderRadius: radius }}
                        />
                        <span className="text-xs text-gray-500 font-mono">
                          {radius}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

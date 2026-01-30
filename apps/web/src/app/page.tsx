import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Globe, Code2, Copy, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/header';

const features = [
  {
    icon: Brain,
    title: 'Smart Transformation',
    description:
      'Converts messy, vague issues into structured, professional prompts that AI coding tools understand.',
  },
  {
    icon: Globe,
    title: 'Hebrew Support',
    description:
      'Write in Hebrew, get perfect English prompts. Automatic language detection and translation.',
  },
  {
    icon: Code2,
    title: 'Agent-Optimized',
    description:
      'Tailored output for Cursor, Lovable, Replit, and Codex. Each agent gets prompts in its preferred style.',
  },
  {
    icon: Zap,
    title: 'Instant Results',
    description:
      'One click to generate. Copy to clipboard and paste directly into your AI coding assistant.',
  },
  {
    icon: Copy,
    title: 'Best Practices Built-in',
    description:
      'Curated guidelines from OpenAI, Anthropic, and Google baked into every prompt you generate.',
  },
  {
    icon: Sparkles,
    title: 'Prompt Linting',
    description:
      'Real-time suggestions to improve your input. Catch vague language before it hurts your results.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container flex flex-col items-center justify-center gap-6 py-20 md:py-32 text-center">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium bg-muted">
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            Transform your prompts
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl">
            Turn messy issues into{' '}
            <span className="text-primary">agent-ready prompts</span>
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Stop writing amateur prompts. Prompt Ops Copilot transforms your rough ideas into
            professional, structured prompts optimized for Cursor, Lovable, Replit, and Codex.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/app">Try Without Account</Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            No credit card required. Works with your own API keys.
          </p>
        </section>

        {/* Demo Section */}
        <section className="container py-12 md:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="text-sm font-medium text-muted-foreground">YOUR INPUT</div>
                <Card className="bg-muted/50">
                  <CardContent className="p-4 font-mono text-sm">
                    הכפתור לא עובד בדף הבית, צריך לתקן את זה
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <div className="text-sm font-medium text-primary">GENERATED PROMPT</div>
                <Card>
                  <CardContent className="p-4 font-mono text-sm space-y-3">
                    <p>
                      <strong>Goal:</strong> Fix the non-functional button on the homepage
                    </p>
                    <p>
                      <strong>Current behavior:</strong> Button click does not trigger any action
                    </p>
                    <p>
                      <strong>Expected behavior:</strong> Button should respond to clicks and
                      perform its intended action
                    </p>
                    <p>
                      <strong>Acceptance criteria:</strong>
                    </p>
                    <ul className="list-disc list-inside pl-2 space-y-1">
                      <li>Button click triggers the expected handler</li>
                      <li>Visual feedback on hover/active states</li>
                      <li>Works across all supported browsers</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container py-12 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need for better prompts
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built with best practices from OpenAI, Anthropic, and leading AI coding tools.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-12 md:py-20">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="flex flex-col items-center justify-center gap-6 py-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to write better prompts?
              </h2>
              <p className="max-w-xl text-primary-foreground/80">
                Join developers who are getting better results from their AI coding assistants.
              </p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">
                  Start for Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold">Prompt Ops Copilot</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built for developers who want better AI results.
          </p>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";
import { Waveform } from "@/components/landing/Waveform";
import { CodePlayerWrapper } from "@/components/landing/CodePlayerWrapper";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-6 py-8 text-center space-y-8 flex-1">
        <Waveform />

        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-fd-primary to-fd-foreground/70 pb-2">
            Make Music with React
          </h1>
          <p className="text-lg sm:text-xl text-fd-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Render audio using the components you know and love.
            <br className="hidden sm:block" />
            Turn your JSX into melodies, beats, and soundscapes.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/docs"
            className="px-8 py-3 rounded-full bg-fd-primary text-fd-primary-foreground font-semibold hover:opacity-90 transition-opacity text-sm sm:text-base"
          >
            Get Started
          </Link>
          <Link
            href="https://github.com/rafalsz98/react-synth"
            className="px-8 py-3 rounded-full bg-fd-secondary text-fd-secondary-foreground font-semibold hover:bg-fd-secondary/80 transition-colors text-sm sm:text-base"
          >
            GitHub
          </Link>
        </div>

        <div className="w-full pt-12 pb-8">
          <CodePlayerWrapper />
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16 bg-fd-muted/20 border-t border-fd-border/50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            title="Declarative Audio"
            description="Compose music using familiar React component structure. Loop, Sequence, and Synth components make audio logic readable."
          />
          <FeatureCard
            title="Two-Clock Scheduling"
            description="Rock-solid timing precision using the Web Audio API clock synchronized with React's render cycle."
          />
          <FeatureCard
            title="Hot Reloading"
            description="Change your song structure or synth parameters in real-time. Hear your changes instantly as you code."
          />
        </div>
      </section>

      {/* Attribution */}
      <section className="px-6 py-8 text-center border-t border-fd-border/50">
        <p className="text-sm text-fd-muted-foreground">
          Inspired by{" "}
          <Link
            href="https://sonic-pi.net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-fd-primary hover:underline"
          >
            Sonic Pi
          </Link>
        </p>
      </section>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-fd-card border border-fd-border hover:shadow-md transition-shadow">
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-fd-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

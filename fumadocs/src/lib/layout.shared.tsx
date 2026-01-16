import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "react-synth",
    },
    links: [
      {
        text: "Docs",
        url: "/docs",
      },
    ],
    githubUrl: "https://github.com/rafalsz98/react-synth",
  };
}

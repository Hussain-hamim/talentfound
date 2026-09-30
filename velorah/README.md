# Velorah

A cinematic, responsive hero built with React, Vite, TypeScript, Tailwind CSS v4, and customized shadcn/ui Button and Dialog components using Radix UI.

## Development

```sh
npm install
npm run dev -- --port 4173
```

`npm run build` checks TypeScript and builds the app into `dist/client`. `npm run preview` serves the production build.

The background streams the supplied CloudFront video. Google Fonts supplies Instrument Serif and Inter. There is no decorative overlay. Reduced motion pauses the video and removes entrance animations; the discreet lower-right control can pause or resume it.

Navigation opens lightweight in-page panels. Both journey buttons open a small intention-setting demo that stores text only in the current browser. Contact and journal panels clearly describe their coming-soon status; no backend or email service is connected.

This standalone app preserves the parent TalentFound Next.js application and existing source changes.

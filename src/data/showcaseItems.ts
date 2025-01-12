export type ShowcaseItemCategory = 'desktop' | 'game' | 'ai' | 'web' | 'extension' | 'about' | 'project' | 'wdygdtw';

export type ShowcaseItem = {
  title: string;
  description: string;
  slug: string;
  category: ShowcaseItemCategory;
  links?: Array<{
    label: string;
    url: string;
  }>;
  technologies: string[];
}

export const getDefaultShowcase = () => showcaseItems[0]?.slug;

export const showcaseItems: ShowcaseItem[] = [
  {
    title: "BTX Game",
    description: "Multiplayer extraction shooter game built in Unity. Implemented core gameplay mechanics including crouch, character integration, scoreboard and vault system with loadout customization. Added proximity voice chat using Dissonance and quick sell feature with infinite scroll selection.",
    slug: "btx-game",
    category: "game",
    links: [
      {
        label: "Play Store",
        url: "https://play.google.com/store/apps/details?id=glip.studio.btx.android&hl=en_IN"
      },
      {
        label: "App Store",
        url: "https://apps.apple.com/us/app/btx-game/id1234567890"
      }
    ],
    technologies: ["Unity", "C#", "Dissonance", "Multiplayer", "Game Development"]
  },
  {
    title: "XNet Platform",
    slug: "xnet-platform",
    description: "Developed a comprehensive NFT platform for game moments. Created electron app for game capture using OBS APIs, web-based crypto wallet, and task completion system with crypto rewards.",
    category: "web",
    links: [
      {
        label: "View Project",
        url: "https://xnet.xtremeverse.xyz/"
      }
    ],
    technologies: ["React", "Node.js", "NFT"]
  },
  {
    title: "Kauri Captioner",
    slug: "kauri-captioner",
    description: "Built a video subtitling tool using Whisper model (transformers.js). Implemented video processing with Canvas API for rendering and ffmpeg.wasm for audio processing.",
    category: "project",
    links: [
      {
        label: "View Project",
        url: "https://amanmamgain9.github.io/sub_gen/"
      }
    ],
    technologies: ["React", "transformers.js", "Canvas API", "ffmpeg.wasm", "Whisper AI"]
  },
  {
    title: "Project Tab Manager",
    slug: "project-tab-manager",
    description: "Chrome extension for project-based tab organization. Built using React and Chrome Extension APIs to help users manage their browser tabs more effectively.",
    category: "project",
    links: [
      {
        label: "GitHub",
        url: "https://github.com/amanmamgain9/project-tab-manager"
      }
    ],
    technologies: ["React", "Chrome Extension API", "JavaScript"]
  }
];

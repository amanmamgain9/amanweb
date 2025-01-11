export type ShowcaseItemCategory = 'desktop' | 'game' | 'ai' | 'web' | 'extension' | 'about' | 'project';

export type ShowcaseItem = {
  title: string;
  description: string;
  category: ShowcaseItemCategory;
  link?: string;
  technologies: string[];
}

export const showcaseItems: ShowcaseItem[] = [
  {
    title: "BTX Game",
    description: "Multiplayer extraction shooter game built in Unity. Implemented core gameplay mechanics including crouch, character integration, scoreboard and vault system with loadout customization. Added proximity voice chat using Dissonance and quick sell feature with infinite scroll selection.",
    category: "game",
    technologies: ["Unity", "C#", "Dissonance", "Multiplayer", "Game Development"]
  },
  {
    title: "XNet Platform",
    description: "Developed a comprehensive NFT platform for game moments. Created electron app for game capture using OBS APIs, web-based crypto wallet, and task completion system with crypto rewards.",
    category: "web",
    technologies: ["React", "Node.js", "NFT"]
  },
  {
    title: "Kauri Captioner",
    description: "Built a video subtitling tool using Whisper model (transformers.js). Implemented video processing with Canvas API for rendering and ffmpeg.wasm for audio processing.",
    category: "project",
    link: "https://amanmamgain9.github.io/sub_gen/",
    technologies: ["React", "transformers.js", "Canvas API", "ffmpeg.wasm", "Whisper AI"]
  },
  {
    title: "Project Tab Manager",
    description: "Chrome extension for project-based tab organization. Built using React and Chrome Extension APIs to help users manage their browser tabs more effectively.",
    category: "project",
    link: "https://github.com/amanmamgain9/project-tab-manager",
    technologies: ["React", "Chrome Extension API", "JavaScript"]
  }
];

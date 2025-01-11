export type ShowcaseItemCategory = 'desktop' | 'game' | 'ai' | 'web' | 'extension' | 'about';

export type ShowcaseItem = {
  title: string;
  description: string;
  category: ShowcaseItemCategory;
  link?: string;
  technologies: string[];
}

export const showcaseItems: ShowcaseItem[] = [
  {
    title: "BTX Game Development",
    description: "Contributed to a multiplayer extraction shooter game in Unity. Implemented core gameplay mechanics including crouch mechanics, character integration, scoreboard system, and vault system with loadout customization. Integrated proximity-based voice chat using Dissonance and developed a quick sell feature with infinite scroll selection.",
    category: "game",
    link: "https://play.google.com/store/apps/details?id=glip.studio.btx.android",
    technologies: ["Unity", "C#", "Multiplayer", "Game Development", "Dissonance"]
  },
  {
    title: "XtremeVerse NFT Platform",
    description: "Contributed to XtremeVerse NFT platform development. Implemented raffle system and NFT display features. Enhanced platform functionality and user experience on xnet.xtremeverse.xyz.",
    category: "web",
    link: "https://xnet.xtremeverse.xyz/",
    technologies: ["React", "Web3", "NFT",]
  },
  {
    title: "Glip Game Capture",
    description: "Developed a low-latency game capture application using OBS APIs. Created an Electron + React application for NFT creation and auction from captured game moments. Implemented a web-based crypto wallet and task completion system with crypto rewards.",
    category: "desktop",
    technologies: ["Electron", "React", "Node.js", "OBS APIs", "Blockchain", "NFT"]
  },
  
  {
    title: "Game Character Chatbot",
    description: "Developed an AI-powered game character chatbot with monetization features. Deployed OobaBooga text generation as a backend service and created a React-based chat interface with voice features using tortoise-tts.",
    category: "ai",
    technologies: ["React", "AI", "OobaBooga", "tortoise-tts", "Text Generation"]
  },
  {
    title: "Kauri Captioner",
    description: "Built a video subtitling tool using Whisper model (transformers.js). Implemented video processing with Canvas API for rendering and ffmpeg.wasm for audio processing.",
    category: "web",
    link: "https://amanmamgain9.github.io/sub_gen/",
    technologies: ["React", "transformers.js", "Canvas API", "ffmpeg.wasm", "Whisper AI"]
  },
  {
    title: "Project Tab Manager",
    description: "Chrome extension for project-based tab organization. Built using React and Chrome Extension APIs to help users manage their browser tabs more effectively.",
    category: "extension",
    link: "https://github.com/amanmamgain9/project-tab-manager",
    technologies: ["React", "Chrome Extension API", "JavaScript"]
  },
  {
    title: "B2B E-commerce Platform",
    description: "Developed a full-stack e-commerce platform connecting manufacturers to consumers. Implemented comprehensive features including order-management, BOM, inventory tracking with warehouse-specific monitoring. Scaled to serve 30+ enterprise clients.",
    category: "web",
    technologies: ["Angular", "Android", "Django", "AWS", "RabbitMQ", "Celery"],
    link: "https://www.back2stores.com/"
  }
];

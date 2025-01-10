export type ShowcaseItemCategory = 'desktop' | 'game' | 'ai' | 'web' | 'extension' | 'about';

export type ShowcaseItem = {
  id: number;
  title: string;
  description: string;
  image: string;
  category: ShowcaseItemCategory;
  link?: string;
  technologies: string[];
}

export const showcaseItems: ShowcaseItem[] = [
  {
    id: 1,
    title: "Glip Game Capture",
    description: "Developed a low-latency game capture application using OBS APIs. Created an Electron + React application for NFT creation and auction from captured game moments. Implemented a web-based crypto wallet and task completion system with crypto rewards.",
    image: "/placeholder-glip.png",
    category: "desktop",
    link: "https://glip.gg",
    technologies: ["Electron", "React", "Node.js", "OBS APIs", "Blockchain", "NFT"]
  },
  {
    id: 2,
    title: "BTX Game Development",
    description: "Contributed to a multiplayer extraction shooter game in Unity. Implemented core gameplay mechanics including crouch mechanics, character integration, scoreboard system, and vault system with loadout customization. Integrated proximity-based voice chat using Dissonance and developed a quick sell feature with infinite scroll selection.",
    image: "/placeholder-btx.png",
    category: "game",
    technologies: ["Unity", "C#", "Multiplayer", "Game Development", "Dissonance"]
  },
  {
    id: 3,
    title: "Game Character Chatbot",
    description: "Developed an AI-powered game character chatbot with monetization features. Deployed OobaBooga text generation as a backend service and created a React-based chat interface with voice features using tortoise-tts.",
    image: "/placeholder-chatbot.png",
    category: "ai",
    technologies: ["React", "AI", "OobaBooga", "tortoise-tts", "Text Generation"]
  },
  {
    id: 4,
    title: "Kauri Captioner",
    description: "Built a video subtitling tool using Whisper model (transformers.js). Implemented video processing with Canvas API for rendering and ffmpeg.wasm for audio processing.",
    image: "/placeholder-kauri.png",
    category: "web",
    link: "https://github.com/yourusername/kauri-captioner",
    technologies: ["React", "transformers.js", "Canvas API", "ffmpeg.wasm", "Whisper AI"]
  },
  {
    id: 5,
    title: "Project Tab Manager",
    description: "Chrome extension for project-based tab organization. Built using React and Chrome Extension APIs to help users manage their browser tabs more effectively.",
    image: "/placeholder-tab-manager.png",
    category: "extension",
    link: "https://github.com/yourusername/project-tab-manager",
    technologies: ["React", "Chrome Extension API", "JavaScript"]
  },
  {
    id: 6,
    title: "B2B E-commerce Platform",
    description: "Developed a full-stack e-commerce platform connecting manufacturers to consumers. Implemented comprehensive features including order-management, BOM, inventory tracking with warehouse-specific monitoring. Scaled to serve 30+ enterprise clients.",
    image: "/placeholder-b2b.png",
    category: "web",
    technologies: ["Angular", "Android", "Django", "AWS", "RabbitMQ", "Celery"]
  },
  {
    id: 7,
    title: "Aman Mamgain",
    description: "Hi, I'm Aman! I'm a Full Stack Developer with 10 years of experience building web applications and distributed systems. I'm passionate about creating efficient, scalable solutions and staying current with emerging technologies.",
    image: "/profile-image.png",
    category: "about",
    link: "/cv.pdf",
    technologies: ["Full Stack Development", "System Architecture", "Cloud Computing", "DevOps"]
  }
];
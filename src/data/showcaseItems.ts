export type ShowcaseItemCategory = 'desktop' | 'game' | 'ai' | 'web' | 'extension' | 'about' | 'side-project';

export type ShowcaseItem = {
  title: string;
  description: string;
  category: ShowcaseItemCategory;
  link?: string;
  technologies: string[];
}

export const showcaseItems: ShowcaseItem[] = [
  {
    title: "Kauri Captioner",
    description: "Built a video subtitling tool using Whisper model (transformers.js). Implemented video processing with Canvas API for rendering and ffmpeg.wasm for audio processing.",
    category: "side-project",
    link: "https://amanmamgain9.github.io/sub_gen/",
    technologies: ["React", "transformers.js", "Canvas API", "ffmpeg.wasm", "Whisper AI"]
  },
  {
    title: "Project Tab Manager",
    description: "Chrome extension for project-based tab organization. Built using React and Chrome Extension APIs to help users manage their browser tabs more effectively.",
    category: "side-project",
    link: "https://github.com/amanmamgain9/project-tab-manager",
    technologies: ["React", "Chrome Extension API", "JavaScript"]
  }
];

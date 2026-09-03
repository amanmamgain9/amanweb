import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  FaArrowRight,
  FaEnvelope,
  FaExternalLinkAlt,
  FaFilePdf,
  FaGithub,
  FaLinkedin,
} from 'react-icons/fa';
import { AndroidModelOverlay } from './AndroidModelOverlay';
import {
  homeContent,
  type ExperienceEntry,
  type FeaturedProject,
} from '../data/homeContent';
import { useActiveExperience } from '../hooks/useActiveExperience';

type RobotPosition = {
  x: number;
  y: number;
  radius: number;
  intensity: number;
} | null;

const focusRingClasses = 'focus-visible:outline-[3px] focus-visible:outline-blue focus-visible:outline-offset-4';
const pageContainerClasses = 'mx-auto w-full max-w-page px-page-gutter-compact sm:px-page-gutter';
const navLinkClasses = `text-sm-plus text-muted no-underline hover:text-ink ${focusRingClasses}`;
const footerLinkClasses = `inline-flex items-center gap-2 border border-white/50 px-4 py-3 text-white no-underline hover:bg-white hover:text-ink ${focusRingClasses}`;

const ProjectBody = ({ project }: { project: FeaturedProject }) => (
  <>
    <div className="relative aspect-[8/5] overflow-hidden border border-line bg-paper-deep">
      <img
        className="h-full w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.025]"
        src={project.image}
        alt=""
      />
      <span
        className={`absolute left-3 top-3 px-2.5 py-1.5 text-caption font-bold uppercase tracking-widest ${
          project.status === 'Live' ? 'bg-blue text-white' : 'bg-launch text-ink'
        }`}
      >
        {project.status}
      </span>
    </div>
    <div className="pt-5">
      <div className="flex items-center justify-between gap-4 [&_svg]:shrink-0 [&_svg]:text-xs [&_svg]:text-muted">
        <h3 className="text-h2 transition-colors duration-150 group-hover:text-blue">
          {project.name}
        </h3>
        {project.href ? <FaExternalLinkAlt aria-hidden="true" /> : null}
      </div>
      <p className="mt-3 max-w-lg text-base leading-relaxed text-muted">{project.summary}</p>
    </div>
  </>
);

const ProjectEntry = ({ project }: { project: FeaturedProject }) => {
  if (project.href) {
    return (
      <a
        className={`group grid content-start text-ink no-underline ${focusRingClasses}`}
        href={project.href}
        target="_blank"
        rel="noreferrer"
      >
        <ProjectBody project={project} />
      </a>
    );
  }

  return (
    <article className="group grid content-start text-ink">
      <ProjectBody project={project} />
    </article>
  );
};

const ExperienceCard = ({ experience }: { experience: ExperienceEntry }) => (
  <>
    <p className="text-caption font-semibold uppercase tracking-widest text-orange">
      {experience.period}
    </p>
    <h3 className="mt-2 text-h3">{experience.company}</h3>
    <p className="mt-1 text-sm-plus text-muted">{experience.role}</p>
    <p className="mt-4 text-base leading-relaxed">{experience.summary}</p>
    <ul className="mt-2 list-none space-y-2 p-0 text-base leading-relaxed">
      {experience.highlights.map((highlight) => (
        <li key={highlight}>— {highlight}</li>
      ))}
    </ul>
    <p className="mt-4 text-sm leading-relaxed text-muted">
      {experience.stack.join(' · ')}
    </p>
  </>
);

export const HomePage = () => {
  const activeExperienceId = useActiveExperience(homeContent.experiences);
  const robotDockRef = useRef<HTMLDivElement | null>(null);
  const [robotPosition, setRobotPosition] = useState<RobotPosition>(null);
  const [robotLoaded, setRobotLoaded] = useState(false);

  useEffect(() => {
    let frame = 0;

    const updateRobotPosition = () => {
      const dock = robotDockRef.current;
      if (!dock) return;

      const rect = dock.getBoundingClientRect();
      const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;

      setRobotPosition(isVisible ? {
        x: rect.left + rect.width * 0.5,
        y: rect.top + rect.height * 0.52,
        radius: window.innerWidth < 640 ? 32 : 44,
        intensity: 0.65,
      } : null);
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateRobotPosition();
      });
    };

    const observer = new IntersectionObserver(scheduleUpdate, {
      threshold: [0, 0.25, 0.75, 1],
    });
    if (robotDockRef.current) observer.observe(robotDockRef.current);

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    scheduleUpdate();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="min-h-dvh overflow-clip bg-paper font-sans text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur-md">
        <nav
          className={`${pageContainerClasses} flex min-h-16 items-center justify-between gap-8`}
          aria-label="Primary navigation"
        >
          <a className={`grid text-ink no-underline ${focusRingClasses}`} href="#top">
            <span className="font-bold tracking-tight">{homeContent.identity.name}</span>
          </a>
          <div className="flex items-center gap-3 sm:gap-6">
            <a className={navLinkClasses} href="/articles/">
              Blog
            </a>
            <a className={navLinkClasses} href="#contact">
              Contact
            </a>
          </div>
        </nav>
      </header>

      <main className={`${pageContainerClasses} relative z-[1]`} id="top">
        <section
          className="relative scroll-mt-24 pb-20 pt-8 md:pb-28 md:pt-14 lg:pb-36"
          id="work"
        >
          <div className="grid gap-x-6 gap-y-14 md:grid-cols-2">
            {homeContent.featuredProjects.map((project) => (
              <ProjectEntry key={project.name} project={project} />
            ))}
          </div>

        </section>

        <section className="scroll-mt-24 border-t border-line py-20 md:py-28 lg:py-36" id="experience">
          <header className="mb-10 lg:mb-16">
            <h2 className="text-h1">Experience</h2>
          </header>
          <div className="grid gap-4 md:grid-cols-2">
            {homeContent.experiences.map((experience) => (
              <article
                className={`min-w-0 border p-6 transition-colors duration-200 ${
                  experience.id === activeExperienceId
                    ? 'border-blue/55 bg-white/65'
                    : 'border-line bg-white/30'
                }`}
                id={experience.id}
                key={experience.id}
              >
                <ExperienceCard experience={experience} />
              </article>
            ))}
          </div>
          <a
            className={`mt-8 inline-flex items-center gap-2.5 text-ink underline underline-offset-4 ${focusRingClasses}`}
            href={homeContent.links.resume}
            target="_blank"
            rel="noreferrer"
          >
            Full résumé <FaFilePdf />
          </a>
        </section>
      </main>

      <footer className="relative z-[1] bg-orange text-white" id="contact">
        <div className={`${pageContainerClasses} grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.35fr_0.65fr] lg:py-28`}>
          <div>
            <p className="text-caption font-bold uppercase tracking-widest">Have a difficult product to build?</p>
            <h2 className="mt-3 text-hero">Let’s make it real.</h2>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                className={footerLinkClasses}
                href={homeContent.links.email}
              >
                <FaEnvelope /> Email
              </a>
              <a
                className={footerLinkClasses}
                href={homeContent.links.calendly}
                target="_blank"
                rel="noreferrer"
              >
                Book a call <FaArrowRight />
              </a>
              <a
                className={footerLinkClasses}
                href={homeContent.links.github}
                target="_blank"
                rel="noreferrer"
              >
                <FaGithub /> GitHub
              </a>
              <a
                className={footerLinkClasses}
                href={homeContent.links.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                <FaLinkedin /> LinkedIn
              </a>
            </div>
          </div>
          <div
            className="relative min-h-56 scroll-mt-16 border border-white/30 bg-white/5 md:min-h-64"
            id="robot"
            ref={robotDockRef}
            aria-label="Animated robot waving hello"
          />
        </div>
      </footer>

      <AndroidModelOverlay
        android={robotPosition}
        onLoaded={() => setRobotLoaded(true)}
        isPeek={false}
      />
      {robotLoaded && robotPosition ? (
        <div
          className="pointer-events-none fixed z-[18] rounded-full border border-ink/30 bg-white/90 px-2 py-1 text-caption text-ink"
          aria-hidden="true"
          style={{
            left: robotPosition.x + robotPosition.radius + 10,
            top: robotPosition.y - robotPosition.radius - 16,
          } as CSSProperties}
        >
          Hi
        </div>
      ) : null}
    </div>
  );
};

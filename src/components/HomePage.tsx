import { useRef, useState, type CSSProperties } from 'react';
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
import { useRobotMovement } from '../hooks/useRobotMovement';

const focusRingClasses = 'focus-visible:outline-[3px] focus-visible:outline-blue focus-visible:outline-offset-4';
const pageContainerClasses = 'mx-auto w-full max-w-page px-page-gutter-compact sm:px-page-gutter';
const navLinkClasses = `text-sm-plus text-muted no-underline hover:text-ink ${focusRingClasses}`;
const footerLinkClasses = `inline-flex items-center gap-2 border border-white/50 px-4 py-3 text-white no-underline hover:bg-white hover:text-ink ${focusRingClasses}`;
const pipelineItemClasses = 'relative min-h-44 border-b border-r border-line p-4 text-ink';
const sectionKickerClasses = 'text-caption font-bold uppercase tracking-widest text-orange';

const ProjectBody = ({ project }: { project: FeaturedProject }) => (
  <>
    <div className="relative aspect-[8/5] overflow-hidden border border-line bg-paper-deep">
      <img
        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.025]"
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
        <h3 className="text-h3 transition-colors duration-150 group-hover:text-blue">
          {project.name}
        </h3>
        {project.href ? <FaExternalLinkAlt aria-hidden="true" /> : null}
      </div>
      <p className="mt-2 text-lg font-semibold">{project.summary}</p>
      <p className="mt-2.5 max-w-lg text-base leading-relaxed text-muted">
        {project.detail}
      </p>
      <ul
        className="mt-4 flex list-none flex-wrap gap-x-4 gap-y-2 p-0 text-caption text-muted [&_li::before]:mr-2 [&_li::before]:text-orange [&_li::before]:content-['•']"
        aria-label={`${project.name} technologies`}
      >
        {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
      </ul>
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

const PipelineBody = ({ name, summary }: { name: string; summary: string }) => (
  <>
    <p className={sectionKickerClasses}>In development</p>
    <h3 className="mt-8 text-h3">{name}</h3>
    <p className="mt-2 text-sm-plus leading-normal text-muted">{summary}</p>
  </>
);

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
  const mainFlowRef = useRef<HTMLElement | null>(null);
  const heroDockRef = useRef<HTMLDivElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);
  const [robotLoaded, setRobotLoaded] = useState(false);
  const {
    scrollingAndroid,
    isPeek,
  } = useRobotMovement({
    mainFlowRef,
    heroVisualRef: heroDockRef,
    footerRef,
    freezeMovement: !robotLoaded,
  });

  return (
    <div className="min-h-dvh overflow-clip bg-paper bg-[linear-gradient(rgba(23,23,20,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(23,23,20,0.025)_1px,transparent_1px)] bg-[size:32px_32px] font-sans text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur-md">
        <nav
          className={`${pageContainerClasses} flex min-h-16 items-center justify-between gap-8`}
          aria-label="Primary navigation"
        >
          <a className={`grid text-ink no-underline ${focusRingClasses}`} href="#top">
            <span className="font-bold tracking-tight">{homeContent.identity.name}</span>
          </a>
          <div className="flex items-center gap-3 sm:gap-6">
            <a className={navLinkClasses} href="#work">
              Work
            </a>
            <a className={navLinkClasses} href="/articles/">
              Writing
            </a>
            <a className={`${navLinkClasses} hidden sm:block`} href="#experience">
              Experience
            </a>
            <a className={`${navLinkClasses} hidden sm:block`} href="#contact">
              Contact
            </a>
          </div>
        </nav>
      </header>

      <main
        className={`${pageContainerClasses} relative z-[1]`}
        id="top"
        ref={mainFlowRef}
      >
        <section
          className="relative scroll-mt-24 pb-20 pt-8 md:pb-28 md:pt-14 lg:pb-36"
          id="work"
        >
          <div
            className="pointer-events-none absolute right-7 top-[clamp(6.5rem,9vw,7.5rem)] h-px w-px"
            ref={heroDockRef}
            aria-label="Home position for the animated robot"
          />
          <div className="grid gap-x-6 gap-y-14 md:grid-cols-2">
            {homeContent.featuredProjects.map((project) => (
              <ProjectEntry key={project.name} project={project} />
            ))}
          </div>

          <div className="mt-20 grid gap-8 border-t border-line pt-8 md:grid-cols-[0.65fr_1.35fr] lg:mt-32">
            <div>
              <p className={`${sectionKickerClasses} mb-3`}>On the bench</p>
              <p className="max-w-72 text-base leading-relaxed text-muted">
                Active builds that will gain links as they become public.
              </p>
            </div>
            <div className="grid border-t border-line lg:grid-cols-3">
              {homeContent.workInProgress.map((item) => item.href ? (
                <a
                  className={`${pipelineItemClasses} no-underline hover:bg-white/45 [&_svg]:absolute [&_svg]:right-4 [&_svg]:top-4 [&_svg]:text-xs ${focusRingClasses}`}
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <PipelineBody name={item.name} summary={item.summary} />
                  <FaExternalLinkAlt aria-hidden="true" />
                </a>
              ) : (
                <article className={pipelineItemClasses} key={item.name}>
                  <PipelineBody name={item.name} summary={item.summary} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="scroll-mt-24 border-t border-line py-20 md:py-28 lg:py-36" id="experience">
          <header className="mb-10 max-w-3xl lg:mb-16">
            <p className={`${sectionKickerClasses} mb-3`}>Experience</p>
            <h2 className="text-h1">The compact version.</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Founding builds, product teams, and operational systems since 2014.
            </p>
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

      <footer className="relative z-[1] bg-orange text-white" id="contact" ref={footerRef}>
        <div className={`${pageContainerClasses} py-16 md:py-24 lg:py-32`}>
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
      </footer>

      <AndroidModelOverlay
        android={scrollingAndroid}
        onLoaded={() => setRobotLoaded(true)}
        isPeek={isPeek}
      />
      {robotLoaded && scrollingAndroid && !isPeek ? (
        <div
          className="pointer-events-none fixed z-[18] rounded-full border border-ink/30 bg-white/90 px-2 py-1 text-caption text-ink"
          aria-hidden="true"
          style={{
            left: scrollingAndroid.x + scrollingAndroid.radius + 10,
            top: scrollingAndroid.y - scrollingAndroid.radius - 16,
          } as CSSProperties}
        >
          Hi
        </div>
      ) : null}
    </div>
  );
};

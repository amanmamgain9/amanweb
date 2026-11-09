import { homeContent, type ExperienceEntry, type Project } from '../data/homeContent';

const focusRingClasses = 'focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-4';
const pageContainerClasses = 'mx-auto w-full max-w-[65rem] px-5';
const navLinkClasses = `text-[15px] text-muted no-underline hover:text-ink ${focusRingClasses}`;
const buttonClasses = `inline-flex items-center rounded-full border border-line bg-white px-5 py-2.5 text-[15px] font-medium text-ink no-underline hover:border-ink ${focusRingClasses}`;
const primaryButtonClasses = `inline-flex items-center rounded-full border border-ink bg-ink px-5 py-2.5 text-[15px] font-medium text-white no-underline ${focusRingClasses}`;
const sectionHeadingClasses = 'mb-9 font-serif text-[clamp(2rem,3.4vw,2.6rem)] font-medium tracking-[-0.02em]';

const ContactButtons = () => (
  <div className="flex flex-wrap gap-2.5">
    <a className={primaryButtonClasses} href={homeContent.links.email}>Email me</a>
    <a className={buttonClasses} href={homeContent.links.calendly} target="_blank" rel="noreferrer">
      Book a call
    </a>
  </div>
);

const PlayThisLifeLogo = () => (
  <span className="inline-flex items-center gap-2">
    <img className="size-[30px]" src={homeContent.featuredProject.logo} alt="" />
    <span className="inline-block -rotate-2 font-retro text-[26px] leading-[1.2] tracking-[-0.025em] text-ptl-cream [-webkit-text-stroke:0.75px_var(--color-ptl-brown)] [paint-order:stroke_fill] [text-shadow:1px_2px_0_var(--color-ptl-brown)]">
      Play This <span className="text-ptl-orange">Life</span>
    </span>
  </span>
);

const FeaturedProject = () => {
  const project = homeContent.featuredProject;

  return (
    <div className="grid items-center gap-10 rounded-[20px] border border-line bg-white p-6 md:grid-cols-[1fr_1.7fr] md:p-8">
      <div>
        <a className={`no-underline ${focusRingClasses}`} href={project.href} target="_blank" rel="noreferrer">
          <PlayThisLifeLogo />
        </a>
        <p className="mt-4 text-[17px]">{project.summary}</p>
        <p className="mt-2.5 text-sm text-muted">{project.role}</p>
        <a className={`${primaryButtonClasses} mt-6`} href={project.href} target="_blank" rel="noreferrer">
          Visit
        </a>
      </div>
      <video
        className="block w-full rounded-xl bg-ink"
        src={project.video}
        poster={project.poster}
        autoPlay
        muted
        loop
        playsInline
        aria-label={`${project.name} demo`}
      />
    </div>
  );
};

const ProjectTile = ({ project }: { project: Project }) => (
  <a
    className={`flex flex-col overflow-hidden rounded-2xl border border-line bg-white text-ink no-underline transition-colors hover:border-ink ${focusRingClasses}`}
    href={project.href}
    target="_blank"
    rel="noreferrer"
  >
    <img className="block aspect-[16/10] w-full border-b border-line object-cover" src={project.image} alt="" loading="lazy" />
    <div className="px-5 pb-5.5 pt-4.5">
      <h3 className="font-serif text-2xl font-medium leading-tight tracking-[-0.02em]">{project.name}</h3>
      <p className="mt-1.5 text-[15px] text-muted">{project.summary}</p>
      <span className="mt-3 inline-block text-sm font-medium">GitHub ↗</span>
    </div>
  </a>
);

const ExperienceRow = ({ experience }: { experience: ExperienceEntry }) => (
  <li className="grid gap-1 border-t border-line py-5.5 first:border-t-0 first:pt-0 md:grid-cols-[120px_1fr] md:gap-5">
    <span className="text-sm text-muted md:pt-1.5">{experience.period}</span>
    <div>
      <h3 className="font-serif text-2xl font-medium leading-tight tracking-[-0.02em]">
        {experience.company}
        {experience.role ? (
          <small className="ml-2 font-sans text-[15px] tracking-normal text-muted">{experience.role}</small>
        ) : null}
      </h3>
      {experience.summary ? <p className="mt-1 text-muted">{experience.summary}</p> : null}
    </div>
  </li>
);

export const HomePage = () => (
  <div className="min-h-dvh bg-paper font-sans text-ink">
    <header className={`${pageContainerClasses} flex items-center justify-between py-6`}>
      <a className={`whitespace-nowrap font-semibold text-ink no-underline ${focusRingClasses}`} href="#top">
        {homeContent.identity.name}
      </a>
      <nav className="flex gap-4 sm:gap-6" aria-label="Primary navigation">
        <a className={navLinkClasses} href="#projects">Projects</a>
        <a className={navLinkClasses} href="#experience">Experience</a>
        <a className={navLinkClasses} href="/articles/">Writing</a>
      </nav>
    </header>

    <main className={pageContainerClasses} id="top">
      <section className="max-w-[42.5rem] pb-18 pt-10 md:pb-24 md:pt-18">
        <h1 className="font-serif text-[clamp(2.4rem,5vw,3.4rem)] font-medium leading-[1.05] tracking-[-0.02em]">
          {homeContent.identity.greeting}
        </h1>
        <p className="mt-5.5 text-lg leading-relaxed">{homeContent.identity.summary}</p>
        <div className="mt-8 flex flex-wrap gap-2.5">
          <ContactButtons />
          <a className={buttonClasses} href={homeContent.links.resume} target="_blank" rel="noreferrer">
            Résumé
          </a>
        </div>
      </section>

      <section className="scroll-mt-6 border-t border-line pb-18 pt-14" id="projects">
        <h2 className={sectionHeadingClasses}>Projects</h2>
        <FeaturedProject />
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {homeContent.projects.map((project) => (
            <ProjectTile key={project.name} project={project} />
          ))}
        </div>
      </section>

      <section className="scroll-mt-6 border-t border-line pb-18 pt-14" id="experience">
        <h2 className={sectionHeadingClasses}>Experience</h2>
        <ul className="list-none p-0">
          {homeContent.experiences.map((experience) => (
            <ExperienceRow key={experience.company} experience={experience} />
          ))}
        </ul>
      </section>
    </main>

    <footer className={`${pageContainerClasses} flex flex-wrap items-center justify-between gap-5 border-t border-line pb-20 pt-14`} id="contact">
      <h2 className="font-serif text-[2rem] font-medium tracking-[-0.02em]">Let's talk.</h2>
      <div className="flex flex-wrap gap-2.5">
        <ContactButtons />
        <a className={buttonClasses} href={homeContent.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
        <a className={buttonClasses} href={homeContent.links.github} target="_blank" rel="noreferrer">GitHub</a>
      </div>
    </footer>
  </div>
);

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import styled, { css, keyframes } from 'styled-components';
import {
  FaArrowDown,
  FaArrowRight,
  FaEnvelope,
  FaFilePdf,
  FaGithub,
  FaLinkedin,
} from 'react-icons/fa';
import { ReflowParagraph, type ReflowBlock } from './ReflowParagraph';
import { AndroidModelOverlay } from './AndroidModelOverlay';
import { homeContent, type ExperienceEntry } from '../data/homeContent';
import { useActiveExperience } from '../hooks/useActiveExperience';

type AndroidPosition = {
  x: number;
  y: number;
  radius: number;
  intensity: number;
  rx?: number;
  ry?: number;
  debugLeft?: number;
  debugTop?: number;
  debugRight?: number;
  debugBottom?: number;
  rawRx?: number;
  rawRy?: number;
} | null;

const hiBubbleFloat = keyframes`
  0% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(0, -3px, 0); }
  100% { transform: translate3d(0, 0, 0); }
`;

const getExperienceCardText = (experience: ExperienceEntry) =>
  ({
    periodSignal: `${experience.period}    ${experience.signal}`,
    heading: experience.company,
    role: experience.role,
    body: [experience.summary, ...experience.highlights].join(' '),
    stack: `Stack: ${experience.stack.join(' • ')}`,
  });

const buildExperienceBlocks = (experience: ExperienceEntry): ReflowBlock[] => {
  const parts = getExperienceCardText(experience);
  return [
    { kind: 'meta', text: parts.periodSignal },
    { kind: 'heading', text: parts.heading },
    { kind: 'role', text: parts.role },
    { kind: 'body', text: parts.body },
    { kind: 'stack', text: parts.stack },
  ];
};

export const HomePage = () => {
  const [isCompact, setIsCompact] = useState(window.innerWidth <= 900);
  const [isMedium, setIsMedium] = useState(window.innerWidth > 900 && window.innerWidth <= 1100);
  const [scrollTick, setScrollTick] = useState(0);
  const [androidFootprint, setAndroidFootprint] = useState<AndroidPosition>(null);
  const [robotDebug, setRobotDebug] = useState(
    () => new URLSearchParams(window.location.search).get('robotDebug') === '1',
  );
  const activeExperienceId = useActiveExperience(homeContent.experiences);
  const activeExperienceIndex = Math.max(
    0,
    homeContent.experiences.findIndex((item) => item.id === activeExperienceId),
  );
  const experienceCardRefs = useRef<(HTMLElement | null)[]>([]);
  const experienceStackRef = useRef<HTMLDivElement | null>(null);
  const mainFlowRef = useRef<HTMLElement | null>(null);
  const heroVisualRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsCompact(w <= 900);
      setIsMedium(w > 900 && w <= 1100);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setScrollTick((current) => current + 1);
      });
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const scrollingAndroid: AndroidPosition = useMemo(() => {
    const flow = mainFlowRef.current;
    if (!flow) return null;

    const flowRect = flow.getBoundingClientRect();
    const vh = window.innerHeight;
    const radius = isCompact ? 20 : 24;

    const HEADER_HEIGHT = 60;
    const ZIG_ZAG_CYCLES = 2.5;
    const AMPLITUDE_FRAC = isCompact ? 0.42 : isMedium ? 0.32 : 0.44;
    const VIEWPORT_PAD = radius + 12;

    const topY = HEADER_HEIGHT + 10;
    const bottomY = vh - radius * 2;
    const progressRaw = (topY - flowRect.top) / Math.max(flowRect.height - vh, 1);
    const progress = Math.max(0, Math.min(1, progressRaw));

    const contentCenter = flowRect.left + flowRect.width * 0.5;
    const amplitude = flowRect.width * AMPLITUDE_FRAC;

    const xRaw = contentCenter + amplitude * Math.cos(progress * ZIG_ZAG_CYCLES * 2 * Math.PI);
    const x = Math.max(VIEWPORT_PAD, Math.min(window.innerWidth - VIEWPORT_PAD, xRaw));

    const y = topY + (bottomY - topY) * progress;

    return {
      x,
      y,
      radius,
      intensity: 0.56 + Math.sin(progress * Math.PI) * 0.36,
    };
  }, [isCompact, scrollTick]);

  useEffect(() => {
    if (!scrollingAndroid) setAndroidFootprint(null);
  }, [scrollingAndroid]);

  const handleFootprintChange = useCallback((next: Exclude<AndroidPosition, null>) => {
    setAndroidFootprint((current) => {
      if (!current) return next;
      const dx = Math.abs(current.x - next.x);
      const dy = Math.abs(current.y - next.y);
      const dr = Math.abs(current.radius - next.radius);
      const drx = Math.abs((current.rx ?? current.radius) - (next.rx ?? next.radius));
      const dry = Math.abs((current.ry ?? current.radius) - (next.ry ?? next.radius));
      if (dx < 0.75 && dy < 0.75 && dr < 0.6 && drx < 0.6 && dry < 0.6) return current;
      return next;
    });
  }, []);

  const reflowObstacle = androidFootprint ?? scrollingAndroid;
  const speechTarget = androidFootprint ?? scrollingAndroid;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey && (event.key === 'd' || event.key === 'D')) {
        setRobotDebug((current) => !current);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <PageShell>
      <AmbientGlow />
      <TopBar>
        <TopNav>
          <NavLink href="#work">Work</NavLink>
          <NavLink href="#projects">Projects</NavLink>
          <NavLink href="#contact">Contact</NavLink>
        </TopNav>
      </TopBar>

      <MainFlow id="top" ref={mainFlowRef}>
        <HeroSection>
          <HeroContent>
            <ReflowParagraph
              blocks={[
                { kind: 'heroEyebrow', text: homeContent.hero.eyebrow.toUpperCase() },
                { kind: 'heroTitle', text: homeContent.hero.name },
                { kind: 'heroTitleAccent', text: homeContent.hero.title },
                { kind: 'heroSummary', text: homeContent.hero.summary },
                { kind: 'heroSupporting', text: homeContent.hero.supporting },
              ]}
              compact={isCompact}
              androidGlobal={reflowObstacle}
            />
            <ActionRow>
              <PrimaryAction href="#work">
                View work <FaArrowDown />
              </PrimaryAction>
              <SecondaryAction href={homeContent.links.resume} target="_blank" rel="noreferrer">
                View resume <FaFilePdf />
              </SecondaryAction>
            </ActionRow>
            <StatsRow>
              {homeContent.hero.stats.map((stat) => (
                <StatPill key={stat.label}>
                  <StatValue>{stat.value}</StatValue>
                  <StatLabel>{stat.label}</StatLabel>
                </StatPill>
              ))}
            </StatsRow>
          </HeroContent>

          <HeroVisual ref={heroVisualRef}>
            <Portrait src="/moi.webp" alt="Aman Mamgain" />
          </HeroVisual>
        </HeroSection>

        <WorkSection id="work">
          <SectionIntro>
            <ReflowParagraph
              blocks={[
                { kind: 'sectionEyebrow', text: 'EXPERIENCE ARC' },
                { kind: 'sectionTitle', text: 'Shipping across product systems, game workflows, and applied AI.' },
                { kind: 'sectionCopy', text: 'Ten years of work across founding builds, operational systems, healthcare products, commerce, and experimental tools.' },
              ]}
              compact={isCompact}
              androidGlobal={reflowObstacle}
            />
          </SectionIntro>

          <TimelineLayout>
            <ExperienceStack ref={experienceStackRef}>
              {homeContent.experiences.map((experience, index) => (
                <ExperienceCard
                  id={experience.id}
                  key={experience.id}
                  $active={index === activeExperienceIndex}
                  ref={(node: HTMLElement | null) => {
                    experienceCardRefs.current[index] = node;
                  }}
                >
                  <ExperienceNarrative $active={index === activeExperienceIndex}>
                    <ReflowParagraph
                      blocks={buildExperienceBlocks(experience)}
                      compact={isCompact}
                      androidGlobal={reflowObstacle}
                    />
                  </ExperienceNarrative>
                </ExperienceCard>
              ))}
            </ExperienceStack>
          </TimelineLayout>
        </WorkSection>

        <ProjectsSection id="projects">
          <SectionIntro>
            <ReflowParagraph
              blocks={[
                { kind: 'sectionEyebrow', text: 'SELECTED BUILDS' },
                { kind: 'sectionTitle', text: 'Personal work that keeps the motion sharp.' },
                { kind: 'sectionCopy', text: 'Browser-side media, small tools, and experiments that turn fuzzy ideas into usable software.' },
              ]}
              compact={isCompact}
              androidGlobal={reflowObstacle}
            />
          </SectionIntro>

          <ProjectsGrid>
            {homeContent.projects.map((project) => (
              <ProjectCard key={project.name}>
                <ReflowParagraph
                  blocks={[
                    { kind: 'projectName', text: project.name },
                    { kind: 'projectSummary', text: project.summary },
                  ]}
                  compact={isCompact}
                  androidGlobal={reflowObstacle}
                />
                <TagRow>
                  {project.tags.map((tag) => (
                    <Tag key={tag}>{tag}</Tag>
                  ))}
                </TagRow>
                <ProjectLink href={project.href} target="_blank" rel="noreferrer">
                  {project.label} <FaArrowRight />
                </ProjectLink>
              </ProjectCard>
            ))}
          </ProjectsGrid>
        </ProjectsSection>

        <PrinciplesSection>
          <SectionIntro>
            <ReflowParagraph
              blocks={[
                { kind: 'sectionEyebrow', text: 'WORKING STYLE' },
                { kind: 'sectionTitle', text: 'Clean surfaces, strong systems, fast loops.' },
              ]}
              compact={isCompact}
              androidGlobal={reflowObstacle}
            />
          </SectionIntro>

          <PrinciplesGrid>
            {homeContent.principles.map((principle) => (
              <PrincipleCard key={principle.title}>
                <ReflowParagraph
                  blocks={[
                    { kind: 'principleTitle', text: principle.title },
                    { kind: 'principleBody', text: principle.body },
                  ]}
                  compact={isCompact}
                  androidGlobal={reflowObstacle}
                />
              </PrincipleCard>
            ))}
          </PrinciplesGrid>
        </PrinciplesSection>
      </MainFlow>

      <Footer id="contact">
        <FooterReflowWrap>
          <ReflowParagraph
            blocks={[
              { kind: 'footerCopy', text: 'Available for product engineering, creative frontend systems, and prototypes that need to feel alive.' },
            ]}
            compact={isCompact}
            androidGlobal={reflowObstacle}
          />
        </FooterReflowWrap>
        <FooterLinks>
          <FooterLink href={homeContent.links.email}>
            <FaEnvelope /> Email
          </FooterLink>
          <FooterLink href={homeContent.links.github} target="_blank" rel="noreferrer">
            <FaGithub /> GitHub
          </FooterLink>
          <FooterLink href={homeContent.links.linkedin} target="_blank" rel="noreferrer">
            <FaLinkedin /> LinkedIn
          </FooterLink>
          <FooterLink href={homeContent.links.resume} target="_blank" rel="noreferrer">
            <FaFilePdf /> Resume
          </FooterLink>
        </FooterLinks>
      </Footer>
      <AndroidModelOverlay android={scrollingAndroid} onFootprintChange={handleFootprintChange} />
      {speechTarget && (
        <HiBubble
          aria-hidden="true"
          style={
            {
              left: speechTarget.x + (speechTarget.rx ?? speechTarget.radius) + 10,
              top: speechTarget.y - (speechTarget.ry ?? speechTarget.radius) - 16,
            } as CSSProperties
          }
        >
          Hi
        </HiBubble>
      )}
      {robotDebug && androidFootprint && (
        <DebugOverlay aria-hidden="true">
          {androidFootprint.debugLeft !== undefined &&
            androidFootprint.debugTop !== undefined &&
            androidFootprint.debugRight !== undefined &&
            androidFootprint.debugBottom !== undefined && (
              <DebugRawBounds
                style={
                  {
                    left: androidFootprint.debugLeft,
                    top: androidFootprint.debugTop,
                    width: androidFootprint.debugRight - androidFootprint.debugLeft,
                    height: androidFootprint.debugBottom - androidFootprint.debugTop,
                  } as CSSProperties
                }
              />
            )}
          <DebugEllipse
            style={
              {
                left: androidFootprint.x - (androidFootprint.rx ?? androidFootprint.radius),
                top: androidFootprint.y - (androidFootprint.ry ?? androidFootprint.radius),
                width: (androidFootprint.rx ?? androidFootprint.radius) * 2,
                height: (androidFootprint.ry ?? androidFootprint.radius) * 2,
              } as CSSProperties
            }
          />
          <DebugCenter
            style={{ left: androidFootprint.x - 4, top: androidFootprint.y - 4 } as CSSProperties}
          />
          <DebugPanel>
            <DebugLine>
              `?robotDebug=1` active (Alt+D toggles)
            </DebugLine>
            <DebugLine>
              center: {androidFootprint.x.toFixed(1)}, {androidFootprint.y.toFixed(1)}
            </DebugLine>
            <DebugLine>
              ellipse rx/ry: {(androidFootprint.rx ?? androidFootprint.radius).toFixed(1)} /{' '}
              {(androidFootprint.ry ?? androidFootprint.radius).toFixed(1)}
            </DebugLine>
            <DebugLine>
              raw bbox:{' '}
              {androidFootprint.debugLeft !== undefined
                ? `${androidFootprint.debugLeft.toFixed(1)}-${androidFootprint.debugRight?.toFixed(1)}`
                : 'n/a'}
            </DebugLine>
            <DebugLine>
              raw rx/ry: {androidFootprint.rawRx?.toFixed(1) ?? 'n/a'} /{' '}
              {androidFootprint.rawRy?.toFixed(1) ?? 'n/a'}
            </DebugLine>
          </DebugPanel>
        </DebugOverlay>
      )}
    </PageShell>
  );
};

const PageShell = styled.div`
  --bg: #100d0b;
  --bg-soft: #18120f;
  --panel: rgba(27, 20, 15, 0.72);
  --panel-strong: rgba(35, 25, 18, 0.86);
  --line: rgba(247, 237, 220, 0.12);
  --text: #f7eddc;
  --muted: #c2b4a0;
  --accent: #ff7a1a;
  --accent-soft: #ffb36a;
  --violet: #8f78ff;
  position: relative;
  min-height: 100dvh;
  overflow: clip;
  background:
    radial-gradient(circle at top left, rgba(255, 121, 30, 0.16), transparent 34%),
    radial-gradient(circle at 80% 12%, rgba(143, 120, 255, 0.18), transparent 30%),
    linear-gradient(180deg, #1a130f 0%, #100d0b 42%, #0d0a08 100%);
  color: var(--text);
`;

const AmbientGlow = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 20% 22%, rgba(255, 179, 106, 0.18), transparent 0 16%),
    radial-gradient(circle at 75% 15%, rgba(143, 120, 255, 0.16), transparent 0 14%),
    radial-gradient(circle at 60% 58%, rgba(255, 122, 26, 0.14), transparent 0 18%);
  filter: blur(30px);
  opacity: 0.8;
`;

const TopBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(16px);
  background: linear-gradient(180deg, rgba(16, 13, 11, 0.84), rgba(16, 13, 11, 0.34));
  border-bottom: 1px solid rgba(247, 237, 220, 0.06);
`;


const TopNav = styled.nav`
  display: flex;
  gap: 1rem;
  width: min(1200px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 1.2rem 0;

  @media (max-width: 768px) {
    width: min(100%, calc(100% - 1.25rem));
    padding: 1rem 0;
  }
`;

const NavLink = styled.a`
  color: var(--muted);
  text-decoration: none;
  font-size: var(--font-size-md);
  letter-spacing: 0.04em;

  &:hover {
    color: var(--text);
  }
`;

const MainFlow = styled.main`
  position: relative;
  z-index: 1;
  width: min(1200px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 2rem 0 5rem;

  @media (max-width: 768px) {
    width: min(100%, calc(100% - 1.25rem));
  }
`;

const HeroSection = styled.section`
  min-height: calc(100dvh - 90px);
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  gap: 2rem;
  align-items: center;
  padding: 2rem 0 4rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    padding-top: 1rem;
  }
`;

const HeroContent = styled.div`
  display: grid;
  gap: 1.25rem;
`;

const ActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
`;

const buttonBase = css`
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.95rem 1.3rem;
  border-radius: 999px;
  text-decoration: none;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    background 180ms ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const PrimaryAction = styled.a`
  ${buttonBase}
  background: linear-gradient(135deg, #ffb36a, #ff7a1a);
  color: #120d0a;
  font-weight: var(--font-weight-bold);
  box-shadow: 0 16px 40px rgba(255, 122, 26, 0.26);
`;

const SecondaryAction = styled.a`
  ${buttonBase}
  border: 1px solid rgba(247, 237, 220, 0.16);
  background: rgba(247, 237, 220, 0.04);
  color: var(--text);
`;

const StatsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  padding-top: 0.6rem;
`;

const StatPill = styled.div`
  padding: 0.9rem 1rem;
  border: 1px solid rgba(247, 237, 220, 0.1);
  border-radius: 1.1rem;
  background: rgba(247, 237, 220, 0.04);
  min-width: 9rem;
`;

const StatValue = styled.div`
  color: var(--text);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
`;

const StatLabel = styled.div`
  margin-top: 0.2rem;
  color: var(--muted);
  font-size: var(--font-size-sm);
`;

const HeroVisual = styled.div`
  position: relative;
  min-height: 28rem;
  display: grid;
  align-items: center;

  @media (max-width: 900px) {
    min-height: auto;
  }
`;

const Portrait = styled.img`
  position: relative;
  display: block;
  width: 100%;
  max-width: 24rem;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: 1.4rem;
  border: 1px solid rgba(247, 237, 220, 0.08);
  filter: saturate(0.95) contrast(1.04);
`;

const WorkSection = styled.section`
  display: grid;
  gap: 2rem;
  padding: 2rem 0 1rem;
`;

const SectionIntro = styled.div`
  max-width: 42rem;
`;

const TimelineLayout = styled.div`
  position: relative;
`;

const ExperienceStack = styled.div`
  position: relative;
  display: grid;
  gap: 1rem;
  padding-top: 0.2rem;
  max-width: 46rem;
  margin: 0 auto;
`;

const ExperienceCard = styled.article<{ $active: boolean }>`
  position: relative;
  padding: 1.5rem;
  width: 100%;
  border-radius: 1.8rem;
  border: 1px solid rgba(247, 237, 220, 0.08);
  background: ${({ $active }) =>
    $active
      ? 'linear-gradient(180deg, rgba(45, 30, 21, 0.96), rgba(20, 14, 11, 0.96))'
      : 'linear-gradient(180deg, rgba(28, 21, 16, 0.82), rgba(18, 14, 11, 0.88))'};
  box-shadow: ${({ $active }) =>
    $active ? '0 26px 55px rgba(0, 0, 0, 0.28)' : '0 14px 32px rgba(0, 0, 0, 0.2)'};
  transform: ${({ $active }) => ($active ? 'translateY(-4px)' : 'translateY(0)')};
  transition:
    transform 220ms ease,
    border-color 220ms ease,
    background 220ms ease,
    box-shadow 220ms ease;
`;

const ExperienceNarrative = styled.div<{ $active: boolean }>`
  margin-top: 0.9rem;
  opacity: ${({ $active }) => ($active ? 1 : 0.78)};
  transition: opacity 220ms ease;
`;

const TagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-top: 1.1rem;
`;

const Tag = styled.span`
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  background: rgba(247, 237, 220, 0.06);
  border: 1px solid rgba(247, 237, 220, 0.08);
  color: var(--text);
  font-size: var(--font-size-sm-plus);
`;

const ProjectsSection = styled.section`
  padding: 4rem 0 1rem;
`;

const ProjectsGrid = styled.div`
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const ProjectCard = styled.article`
  padding: 1.35rem;
  border-radius: 1.6rem;
  border: 1px solid rgba(247, 237, 220, 0.08);
  background: linear-gradient(180deg, rgba(27, 20, 15, 0.86), rgba(18, 14, 11, 0.92));
`;

const ProjectLink = styled.a`
  margin-top: 1.2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: var(--accent-soft);
  text-decoration: none;
`;

const PrinciplesSection = styled.section`
  padding: 4rem 0 2rem;
`;

const PrinciplesGrid = styled.div`
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const PrincipleCard = styled.article`
  padding: 1.35rem;
  border-radius: 1.6rem;
  border: 1px solid rgba(247, 237, 220, 0.08);
  background: linear-gradient(180deg, rgba(24, 18, 14, 0.82), rgba(16, 13, 11, 0.92));
`;

const Footer = styled.footer`
  position: relative;
  z-index: 1;
  width: min(1200px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 0 0 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: min(100%, calc(100% - 1.25rem));
  }
`;

const FooterReflowWrap = styled.div`
  max-width: 38rem;
  flex: 1;
`;

const FooterLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
`;

const FooterLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.8rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(247, 237, 220, 0.1);
  background: rgba(247, 237, 220, 0.04);
  color: var(--text);
  text-decoration: none;
`;

const DebugOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 30;
  pointer-events: none;
`;

const DebugRawBounds = styled.div`
  position: fixed;
  border: 1px dashed rgba(74, 222, 128, 0.95);
  background: rgba(74, 222, 128, 0.06);
`;

const DebugEllipse = styled.div`
  position: fixed;
  border: 2px solid rgba(56, 189, 248, 0.95);
  background: rgba(56, 189, 248, 0.08);
  border-radius: 999px;
`;

const DebugCenter = styled.div`
  position: fixed;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(248, 113, 113, 0.95);
`;

const DebugPanel = styled.div`
  position: fixed;
  right: 0.8rem;
  top: 0.8rem;
  display: grid;
  gap: 0.25rem;
  padding: 0.55rem 0.65rem;
  border-radius: 0.65rem;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(8, 10, 16, 0.88);
  color: #d9e7ff;
  font-size: var(--font-size-2xs);
  line-height: 1.35;
`;

const DebugLine = styled.div`
  white-space: nowrap;
`;

const HiBubble = styled.div`
  position: fixed;
  z-index: 18;
  pointer-events: none;
  padding: 0.32rem 0.58rem;
  border-radius: 999px;
  border: 1px solid rgba(230, 250, 255, 0.7);
  background: rgba(28, 29, 39, 0.88);
  color: #ebf9ff;
  font-size: var(--font-size-2xs);
  line-height: 1;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
  animation: ${hiBubbleFloat} 2.2s ease-in-out infinite;
`;

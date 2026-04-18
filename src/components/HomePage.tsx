import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import styled, { css, keyframes } from 'styled-components';
import {
  FaArrowDown,
  FaCalendarAlt,
  FaEnvelope,
  FaFilePdf,
  FaGithub,
  FaLinkedin,
} from 'react-icons/fa';
import { ReflowParagraph, type ReflowBlock } from './ReflowParagraph';
import { AndroidModelOverlay } from './AndroidModelOverlay';
import { homeContent, type ExperienceEntry } from '../data/homeContent';
import { useActiveExperience } from '../hooks/useActiveExperience';
import { useRobotMovement } from '../hooks/useRobotMovement';

const buildExperienceBlocks = (experience: ExperienceEntry): ReflowBlock[] => {
  const baseBlocks: ReflowBlock[] = [
    { kind: 'meta', text: experience.period },
    { kind: 'heading', text: experience.company },
    { kind: 'role', text: experience.role },
  ];

  const detailLines = [experience.summary, ...experience.highlights]
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `- ${line}`);

  return [
    ...baseBlocks,
    ...detailLines.map((line) => ({ kind: 'body' as const, text: line })),
    { kind: 'stack', text: `Stack: ${experience.stack.join(' • ')}` },
  ];
};

const hiBubbleFloat = keyframes`
  0% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(0, -3px, 0); }
  100% { transform: translate3d(0, 0, 0); }
`;

export const HomePage = () => {
  const activeExperienceId = useActiveExperience(homeContent.experiences);
  const activeExperienceIndex = Math.max(
    0,
    homeContent.experiences.findIndex((item) => item.id === activeExperienceId),
  );
  const experienceCardRefs = useRef<(HTMLElement | null)[]>([]);
  const experienceStackRef = useRef<HTMLDivElement | null>(null);
  const mainFlowRef = useRef<HTMLElement | null>(null);
  const heroDockRef = useRef<HTMLDivElement | null>(null);
  const [isHiRobotLoaded, setIsHiRobotLoaded] = useState(false);
  const [isOtherLinksOpen, setIsOtherLinksOpen] = useState(false);
  const {
    isCompact,
    scrollingAndroid,
    reflowObstacle,
    speechTarget,
    handleFootprintChange,
  } = useRobotMovement({
    mainFlowRef,
    heroVisualRef: heroDockRef,
    freezeMovement: !isHiRobotLoaded,
  });

  useEffect(() => {
    if (!isOtherLinksOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOtherLinksOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOtherLinksOpen]);

  return (
    <PageShell>
      <AmbientGlow />
      <TopBar>
        <TopNav>
          <NavLink href="#work">Work</NavLink>
          <NavLink href="#contact">Contact</NavLink>
        </TopNav>
      </TopBar>

      <MainFlow id="top" ref={mainFlowRef}>
        <HeroSection>
          <HeroContent>
            <HeroTextStack>
              {homeContent.hero.eyebrow ? <HeroEyebrow>{homeContent.hero.eyebrow.toUpperCase()}</HeroEyebrow> : null}
              <HeroName>{homeContent.hero.name}</HeroName>
              <HeroTitleAccent>{homeContent.hero.title}</HeroTitleAccent>
              <HeroSummary>{homeContent.hero.summary}</HeroSummary>
              <HeroSupporting>{homeContent.hero.supporting}</HeroSupporting>
            </HeroTextStack>
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

          <HeroVisual>
            <HeroRobotDock ref={heroDockRef} />
          </HeroVisual>
        </HeroSection>

        <WorkSection id="work">
          <SectionIntro>
            <ReflowParagraph
              blocks={[
                { kind: 'sectionTitle', text: 'Experience' },
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
                  <ExperienceNarrative>
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

      </MainFlow>

      <Footer id="contact">
        <FooterLinks>
          <FooterLink href={homeContent.links.calendly} target="_blank" rel="noreferrer">
            <FaCalendarAlt /> Set up a call
          </FooterLink>
          <FooterLink href={homeContent.links.github} target="_blank" rel="noreferrer">
            <FaGithub /> GitHub
          </FooterLink>
          <FooterLinkButton type="button" onClick={() => setIsOtherLinksOpen(true)}>
            Other links
          </FooterLinkButton>
        </FooterLinks>
      </Footer>
      {isOtherLinksOpen && (
        <LinksScrim
          role="presentation"
          onClick={() => setIsOtherLinksOpen(false)}
        >
          <LinksDialog
            role="dialog"
            aria-modal="true"
            aria-label="Other links"
            onClick={(event) => event.stopPropagation()}
          >
            <DialogHeading>Other links</DialogHeading>
            <DialogLinks>
              <DialogLink href={homeContent.links.email}>
                <FaEnvelope /> Email
              </DialogLink>
              <DialogLink href={homeContent.links.linkedin} target="_blank" rel="noreferrer">
                <FaLinkedin /> LinkedIn
              </DialogLink>
              <DialogLink href={homeContent.links.resume} target="_blank" rel="noreferrer">
                <FaFilePdf /> Resume
              </DialogLink>
            </DialogLinks>
            <DialogCloseButton type="button" onClick={() => setIsOtherLinksOpen(false)}>
              Close
            </DialogCloseButton>
          </LinksDialog>
        </LinksScrim>
      )}
      <AndroidModelOverlay
        android={scrollingAndroid}
        onFootprintChange={handleFootprintChange}
        onLoaded={() => setIsHiRobotLoaded(true)}
      />
      {isHiRobotLoaded && speechTarget && (
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
    </PageShell>
  );
};

const PageShell = styled.div`
  --bg: #fff6dc;
  --bg-soft: #fff8dc;
  --panel: rgba(255, 250, 240, 0.88);
  --panel-strong: rgba(245, 222, 179, 0.74);
  --line: rgba(222, 184, 135, 0.32);
  --text: #333333;
  --muted: #586e75;
  --accent: #deb887;
  --accent-soft: #b58900;
  --violet: #268bd2;
  position: relative;
  min-height: 100dvh;
  overflow: clip;
  background:
    radial-gradient(circle at 6% 5%, rgba(222, 184, 135, 0.2), transparent 34%),
    radial-gradient(circle at 86% 14%, rgba(38, 139, 210, 0.08), transparent 30%),
    linear-gradient(180deg, #fffaf0 0%, #fff6dc 44%, #fff2cf 100%);
  color: var(--text);
`;

const AmbientGlow = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 18% 22%, rgba(222, 184, 135, 0.18), transparent 0 16%),
    radial-gradient(circle at 75% 16%, rgba(38, 139, 210, 0.1), transparent 0 14%),
    radial-gradient(circle at 58% 58%, rgba(181, 137, 0, 0.1), transparent 0 18%);
  filter: blur(30px);
  opacity: 0.8;
`;

const TopBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(16px);
  background: linear-gradient(180deg, rgba(255, 248, 228, 0.94), rgba(255, 246, 220, 0.82));
  border-bottom: 1px solid rgba(222, 184, 135, 0.32);
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
  grid-template-columns: minmax(0, 1fr) minmax(300px, 420px);
  gap: clamp(1.5rem, 3vw, 2.6rem);
  align-items: start;
  padding: 1.35rem 0 4rem;

  @media (min-width: 1536px) {
    min-height: 74vh;
    padding-bottom: 2.3rem;
  }

  @media (max-width: 1120px) {
    grid-template-columns: 1fr;
    padding-top: 1rem;
  }
`;

const HeroContent = styled.div`
  min-width: 0;
  max-width: 100%;
  display: grid;
  gap: 1.25rem;
`;

const HeroTextStack = styled.div`
  max-width: 38rem;
`;

const HeroEyebrow = styled.p`
  color: #b58900;
  font-size: clamp(0.7rem, 1.2vw, 0.82rem);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.08em;
  margin-bottom: 0.2rem;
`;

const HeroName = styled.h1`
  color: #333333;
  font-size: clamp(2.35rem, 5.8vw, 4rem);
  line-height: 0.98;
  font-weight: var(--font-weight-semibold);
  letter-spacing: -0.02em;
`;

const HeroTitleAccent = styled.p`
  color: #cb4b16;
  font-size: clamp(2.15rem, 5.2vw, 3.7rem);
  line-height: 0.98;
  font-weight: var(--font-weight-semibold);
  letter-spacing: -0.02em;
  margin-top: 0.1rem;
`;

const HeroSummary = styled.p`
  color: #333333;
  font-size: clamp(1.02rem, 1.9vw, 1.3rem);
  line-height: 1.45;
  margin-top: 0.85rem;
  max-width: 34rem;
`;

const HeroSupporting = styled.p`
  color: #586e75;
  font-size: clamp(0.95rem, 1.5vw, 1.05rem);
  line-height: 1.5;
  margin-top: 0.3rem;
  max-width: 34rem;
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
  background: linear-gradient(135deg, #deb887, #c9a36a);
  color: #333333;
  font-weight: var(--font-weight-bold);
  box-shadow: 0 16px 40px rgba(176, 128, 71, 0.2);
`;

const SecondaryAction = styled.a`
  ${buttonBase}
  border: 1px solid rgba(181, 137, 0, 0.22);
  background: rgba(255, 250, 240, 0.7);
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
  border: 1px solid rgba(181, 137, 0, 0.2);
  border-radius: 1.1rem;
  background: rgba(255, 250, 240, 0.62);
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
  min-height: 32rem;
  display: grid;
  align-items: center;
  justify-items: end;

  @media (max-width: 1120px) {
    min-height: auto;
    justify-items: start;
  }
`;

const HeroRobotDock = styled.div`
  width: min(100%, 20rem);
  aspect-ratio: 4 / 5;
  border-radius: 1.4rem;
  border: 1px solid rgba(181, 137, 0, 0.2);
  background:
    radial-gradient(circle at 68% 26%, rgba(38, 139, 210, 0.1), transparent 42%),
    radial-gradient(circle at 24% 62%, rgba(222, 184, 135, 0.2), transparent 48%),
    linear-gradient(160deg, rgba(255, 248, 228, 0.96), rgba(245, 233, 203, 0.94));
  box-shadow: 0 14px 30px rgba(136, 108, 62, 0.14);

  @media (max-width: 1120px) {
    width: min(60%, 13rem);
    aspect-ratio: 1 / 1;
    border-radius: 1.1rem;
  }

  @media (max-width: 640px) {
    width: min(55%, 11rem);
  }
`;

const WorkSection = styled.section`
  scroll-margin-top: 5.5rem;
  display: grid;
  gap: 2rem;
  padding: 2rem 0 1rem;

  @media (min-width: 1536px) {
    padding-top: 1.25rem;
  }
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
  border: 1px solid rgba(181, 137, 0, 0.2);
  background: ${({ $active }) =>
    $active
      ? 'linear-gradient(180deg, rgba(255, 250, 240, 0.98), rgba(245, 233, 203, 0.96))'
      : 'linear-gradient(180deg, rgba(255, 248, 228, 0.9), rgba(245, 233, 203, 0.86))'};
  box-shadow: ${({ $active }) =>
    $active ? '0 20px 45px rgba(136, 108, 62, 0.16)' : '0 10px 24px rgba(136, 108, 62, 0.12)'};
  transform: ${({ $active }) => ($active ? 'translateY(-4px)' : 'translateY(0)')};
  transition:
    transform 220ms ease,
    border-color 220ms ease,
    background 220ms ease,
    box-shadow 220ms ease;
`;

const ExperienceNarrative = styled.div`
  margin-top: 0.9rem;
  opacity: 1;
`;

const Footer = styled.footer`
  position: relative;
  z-index: 1;
  width: min(1200px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 0.3rem 0 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: min(100%, calc(100% - 1.25rem));
  }
`;

const FooterLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
`;

const footerLinkBase = css`
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.8rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(181, 137, 0, 0.22);
  background: rgba(255, 250, 240, 0.74);
  color: var(--text);
`;

const FooterLink = styled.a`
  ${footerLinkBase}
  text-decoration: none;
`;

const FooterLinkButton = styled.button`
  ${footerLinkBase}
  cursor: pointer;
  font-family: inherit;
  font-size: var(--font-size-md);
`;

const LinksScrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgba(44, 40, 30, 0.24);
  display: grid;
  place-items: center;
  padding: 1rem;
`;

const LinksDialog = styled.div`
  width: min(100%, 24rem);
  border-radius: 1rem;
  border: 1px solid rgba(181, 137, 0, 0.22);
  background: rgba(255, 248, 228, 0.98);
  box-shadow: 0 20px 42px rgba(120, 95, 58, 0.22);
  padding: 1rem;
  display: grid;
  gap: 0.8rem;
`;

const DialogHeading = styled.h3`
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text);
`;

const DialogLinks = styled.div`
  display: grid;
  gap: 0.6rem;
`;

const DialogLink = styled.a`
  ${footerLinkBase}
  text-decoration: none;
  justify-content: flex-start;
`;

const DialogCloseButton = styled.button`
  justify-self: end;
  border: 1px solid rgba(181, 137, 0, 0.22);
  background: rgba(255, 250, 240, 0.8);
  color: var(--text);
  border-radius: 999px;
  padding: 0.45rem 0.8rem;
  font-family: inherit;
  font-size: var(--font-size-sm);
  cursor: pointer;
`;

const HiBubble = styled.div`
  position: fixed;
  z-index: 18;
  pointer-events: none;
  padding: 0.32rem 0.58rem;
  border-radius: 999px;
  border: 1px solid rgba(181, 137, 0, 0.5);
  background: rgba(255, 250, 240, 0.9);
  color: #333333;
  font-size: var(--font-size-2xs);
  line-height: 1;
  box-shadow: 0 6px 18px rgba(130, 105, 73, 0.2);
  animation: ${hiBubbleFloat} 2.2s ease-in-out infinite;
`;


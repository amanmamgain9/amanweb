import { useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import {
  FaArrowDown,
  FaArrowRight,
  FaEnvelope,
  FaFilePdf,
  FaGithub,
  FaLinkedin,
} from 'react-icons/fa';
import { ReflowParagraph, type ReflowBlock } from './ReflowParagraph';
import { HeroRobotCard } from './HeroRobotCard';
import { homeContent, type ExperienceEntry } from '../data/homeContent';
import { useActiveExperience } from '../hooks/useActiveExperience';

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
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 900 : false,
  );
  const activeExperienceId = useActiveExperience(homeContent.experiences);
  const activeExperienceIndex = Math.max(
    0,
    homeContent.experiences.findIndex((item) => item.id === activeExperienceId),
  );
  const experienceCardRefs = useRef<(HTMLElement | null)[]>([]);
  const experienceStackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onResize = () => setIsCompact(window.innerWidth <= 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
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

      <MainFlow id="top">
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
            <HeroRobotCard />
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
  background: rgba(222, 184, 135, 0.22);
  border: 1px solid rgba(181, 137, 0, 0.2);
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
  border: 1px solid rgba(181, 137, 0, 0.2);
  background: linear-gradient(180deg, rgba(255, 248, 228, 0.92), rgba(245, 233, 203, 0.9));
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
  border: 1px solid rgba(181, 137, 0, 0.2);
  background: linear-gradient(180deg, rgba(255, 248, 228, 0.88), rgba(245, 233, 203, 0.9));
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
  border: 1px solid rgba(181, 137, 0, 0.22);
  background: rgba(255, 250, 240, 0.74);
  color: var(--text);
  text-decoration: none;
`;


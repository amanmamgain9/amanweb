import React from 'react';
import styled from 'styled-components';
import { FaGithub, FaLinkedin, FaEnvelope, FaFilePdf, FaCode, FaUsers, FaRobot } from 'react-icons/fa';

const AboutContainer = styled.div`
  padding: 2rem;
  height: 100%;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const ProfileImage = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  border: 2px solid rgba(0, 240, 255, 0.2);
  object-fit: cover;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
    border-color: #00f0ff;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const Name = styled.h1`
  font-size: 2.5rem;
  color: #00f0ff;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: #b3e5fc;
  margin-bottom: 1rem;
`;

const Bio = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  color: #b3e5fc;
  margin-bottom: 1.5rem;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const SocialLink = styled.a`
  color: #00f0ff;
  font-size: 1.5rem;
  transition: all 0.2s;
  padding: 0.5rem;
  border-radius: 50%;
  background: rgba(0, 240, 255, 0.1);

  &:hover {
    transform: translateY(-2px);
    background: rgba(0, 240, 255, 0.2);
  }
`;

const InterestsSection = styled.div`
  margin-top: 2rem;
`;

const InterestsTitle = styled.h3`
  font-size: 2rem;
  color: #00f0ff;
  margin-bottom: 1rem;
`;

const InterestsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const InterestCard = styled.div`
  background: rgba(0, 240, 255, 0.05);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;

  &:hover {
    transform: translateX(5px);
    background: rgba(0, 240, 255, 0.1);
  }
`;

const InterestIcon = styled.div`
  font-size: 1.5rem;
  color: #00f0ff;
  display: flex;
  align-items: center;
`;

const InterestText = styled.p`
  color: #b3e5fc;
  font-size: 1.1rem;
  line-height: 1.4;
`;


export const AboutPage: React.FC = () => {
  return (
    <AboutContainer>
      <ProfileSection>
        <ProfileImage src="/moi.webp" alt="Aman Mamgain" />
        <ProfileInfo>
          <Name>Aman Mamgain</Name>
          <Title>Full Stack Developer</Title>
          <Bio>
            Hey there! 👋 I'm Aman been coding full-stack for 10 years<br />
            Currently living in Goa, India. <br />
            Love all kinds of electronic music 🎧 and ☕️ <br/>
          </Bio>
          <SocialLinks>
            <SocialLink href="https://github.com/amanmamgain9" target="_blank" title="GitHub">
              <FaGithub />
            </SocialLink>
            <SocialLink href="https://linkedin.com/in/aman-mamgain-7729599b/" target="_blank" title="LinkedIn">
              <FaLinkedin />
            </SocialLink>
            <SocialLink href="mailto:amanmamgain9@gmail.com" title="Email">
              <FaEnvelope />
            </SocialLink>
            <SocialLink href="/aman.pdf" target="_blank" title="View CV">
              <FaFilePdf />
            </SocialLink>
          </SocialLinks>
        </ProfileInfo>
      </ProfileSection>

      <InterestsSection>
        <InterestsTitle>What I Love Doing</InterestsTitle>
        <InterestsGrid>
          <InterestCard>
            <InterestIcon>
              <FaUsers />
            </InterestIcon>
            <InterestText>
              Being useful and trying out new technologies
            </InterestText>
          </InterestCard>
          <InterestCard>
            <InterestIcon>
              <FaCode />
            </InterestIcon>
            <InterestText>
              Building web applications and software in general
            </InterestText>
          </InterestCard>
          <InterestCard>
            <InterestIcon>
              <FaRobot />
            </InterestIcon>
            <InterestText>
              Currently interested in the AI
            </InterestText>
          </InterestCard>
        </InterestsGrid>
      </InterestsSection>
    </AboutContainer>
  );
};
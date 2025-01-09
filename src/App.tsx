import { useState } from 'react'
import { Navbar } from './components/Navbar'
import { ShowcaseList } from './components/ShowcaseList'
import { ShowcaseDetail } from './components/ShowcaseDetail'
import { showcaseItems } from './data/showcaseItems'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #0a1929;
  color: #00f0ff;
`

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
  padding-top: 5rem; /* Add space for the navbar */
  overflow: auto;

  @media (max-width: 768px) {
    padding: 1rem;
    padding-bottom: 5rem; /* Add space for the bottom navbar on mobile */
  }
`

const DetailSection = styled.div<{ 
  $isProjectsPage: boolean;
  $transitionState: 'idle' | 'content' | 'layout' | 'cleanup';
}>`
  width: ${props => {
    if (props.$transitionState === 'layout' || props.$transitionState === 'cleanup') {
      return '100%';
    }
    return props.$isProjectsPage ? '61.8%' : '100%';
  }};
  transition: width 0.3s ease-in-out;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`

const MainContent = styled.div<{ 
  $isProjectsPage: boolean;
  $transitionState: 'idle' | 'content' | 'layout' | 'cleanup';
}>`
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: row;
  background: rgba(10, 25, 41, 0.8);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  opacity: ${props => props.$transitionState === 'content' ? 0 : 1};
  transform: translateY(${props => props.$transitionState === 'content' ? '20px' : '0'});
  transition: ${props => {
    if (props.$transitionState === 'layout') {
      return 'width 0.3s ease-in-out';
    }
    return 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
  }};
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1rem;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
`

export default function App() {
  const [activePage, setActivePage] = useState('PROJECTS')
  const [selectedItemId, setSelectedItemId] = useState<number | null>(showcaseItems[0].id)
  const [transitionState, setTransitionState] = useState<'idle' | 'content' | 'layout' | 'cleanup'>('idle')

  const selectedItem = selectedItemId 
    ? showcaseItems.find(item => item.id === selectedItemId)
    : null

  const handlePageChange = (page: string) => {
    if (page === activePage) return;
    
    if (page === 'PROJECTS') {
      // Going TO Projects page - focus on internal transitions
      setTransitionState('content');
      setActivePage(page);
      setIsContentVisible(true); // Keep main content visible
      
      // Layout changes after content updates
      setTimeout(() => {
        setTransitionState('layout');
      }, 250);
      
      // Cleanup and reset
      setTimeout(() => {
        setTransitionState('cleanup');
      }, 550);
      
      setTimeout(() => {
        setTransitionState('idle');
      }, 600);
    } else {
      // Going FROM Projects page - use main content transition
      setTransitionState('content');
      
      setTimeout(() => {
        setActivePage(page);
        setTransitionState('layout');
      }, 300);
      
      setTimeout(() => {
        setTransitionState('cleanup');
      }, 600);
      
      setTimeout(() => {
        setTransitionState('idle');
      }, 600);
    }
  }

  return (
    <Container>
      <Navbar 
        activePage={activePage}
        onPageChange={handlePageChange}
      />
      
      <ContentContainer>
        <MainContent 
          $isProjectsPage={activePage === 'PROJECTS'}
          $transitionState={transitionState}
        >
        {(activePage === 'PROJECTS' || transitionState === 'content' || transitionState === 'layout') && (
          <ShowcaseList
            items={showcaseItems}
            onItemSelect={setSelectedItemId}
            transitionState={transitionState}
          />
        )}
        <DetailSection 
          $isProjectsPage={activePage === 'PROJECTS'}
          $transitionState={transitionState}
        >
          {activePage === 'PROJECTS' ? (
            selectedItem && (
              <ShowcaseDetail
                item={selectedItem}
                onClose={() => setSelectedItemId(null)}
                isProjectsPage={true}
                transitionState={transitionState}
              />
            )
          ) : (
            <ShowcaseDetail
              transitionState={transitionState}
              item={{
                id: 0,
                title: "Aman Mamgain",
                description: `Hi, I'm Aman! I'm a Full Stack Developer with 10 years of experience building web applications and distributed systems. I'm passionate about creating efficient, scalable solutions and staying current with emerging technologies.`,
                image: "/profile-image.png",
                category: "about",
                link: "/cv.pdf",
                technologies: ["Full Stack Development", "System Architecture", "Cloud Computing", "DevOps"]
              }}
              onClose={() => {}}
              isProjectsPage={false}
            />
          )}
        </DetailSection>
        </MainContent>
      </ContentContainer>
    </Container>
  )
}

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
  padding-top: 5rem;

  @media (max-width: 768px) {
    padding: 1rem;
    padding-bottom: 5rem;
  }
`

const DetailSection = styled.div<{ 
  $isProjectsPage: boolean;
  $phase: string;
}>`
  width: ${props => {
    if (props.$phase === 'initial') return '100%';
    if (props.$phase === 'expanding') return '80%';
    return props.$isProjectsPage ? '61.8%' : '100%';
  }};
  transition: width 0.3s ease-in-out;
  background-color: #0a1929;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`

const MainContent = styled.div<{ $isProjectsPage: boolean }>`
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: row;
  background: rgba(10, 25, 41, 0.8);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
  const [transitionPhase, setTransitionPhase] = useState<'initial' | 'expanding' | 'complete'>('complete')

  const selectedItem = selectedItemId 
    ? showcaseItems.find(item => item.id === selectedItemId)
    : null

  const handlePageChange = async (page: string) => {
    if (page === activePage) return;
    
    if (page === 'PROJECTS' && activePage === 'ABOUT') {
      setTransitionPhase('initial');
      await new Promise(resolve => setTimeout(resolve, 50));
      
      setTransitionPhase('expanding');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setTransitionPhase('complete');
    }
    
    setActivePage(page);
  }

  return (
    <Container>
      <Navbar 
        activePage={activePage}
        onPageChange={handlePageChange}
      />
      
      <ContentContainer>
        <MainContent $isProjectsPage={activePage === 'PROJECTS'}>
          {activePage === 'PROJECTS' && (
            <ShowcaseList
              items={showcaseItems}
              onItemSelect={setSelectedItemId}
            />
          )}
          <DetailSection 
            $isProjectsPage={activePage === 'PROJECTS'}
            $phase={transitionPhase}
          >
            {activePage === 'PROJECTS' ? (
              selectedItem && (
                <ShowcaseDetail
                  item={selectedItem}
                  onClose={() => setSelectedItemId(null)}
                  isProjectsPage={true}
                />
              )
            ) : (
              <ShowcaseDetail
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

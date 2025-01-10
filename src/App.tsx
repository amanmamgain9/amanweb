import { useState, useRef } from 'react'
import useTransitionLayout from './libs/useTransitionLayout'
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

const ListSection = styled.div`
  overflow: hidden;
  width: 0;
  
  @media (max-width: 768px) {
    width: 100%;
    height: auto;
  }
`

const DetailSection = styled.div`
  background-color: #0a1929;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`

const MainContent = styled.div`
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: row;
  background: rgba(10, 25, 41, 0.8);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  & > ${ListSection} {
    border-right: 1px solid #1c4c7c;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
`

export default function App() {
  const [selectedItemId, setSelectedItemId] = useState<number | null>(showcaseItems[0].id)
  
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const selectedItem = selectedItemId 
    ? showcaseItems.find(item => item.id === selectedItemId)
    : null

  const { Layout, navigateTo, currentRoute } = useTransitionLayout({
    duration: 700,
    containerRef,
    listRef,
    contentRef,
    initialRoute: 'PROJECTS',
    layouts: {
      PROJECTS: {
        list: (
          <ShowcaseList
            items={showcaseItems}
            onItemSelect={setSelectedItemId}
            isVisible={true}
          />
        ),
        content: selectedItem && (
          <ShowcaseDetail
            item={selectedItem}
            onClose={() => setSelectedItemId(null)}
          />
        )
      },
      ABOUT: {
        content: (
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
          />
        )
      },
      HOME: {
        content: (
          <ShowcaseDetail
            item={{
              id: -1,
              title: "Welcome",
              description: "Welcome to my portfolio. Browse through my projects and articles to learn more about my work.",
              image: "/welcome-image.png",
              category: "home",
              technologies: []
            }}
            onClose={() => {}}
          />
        )
      }
    }
  });

  const handlePageChange = (page: string) => {
    if (page === currentRoute) return;
    navigateTo(page);
  }

  return (
    <Container>
      <Navbar 
        activePage={currentRoute}
        onPageChange={handlePageChange}
      />
      <ContentContainer>
        <MainContent 
          ref={containerRef}
        >
          <ListSection 
            ref={listRef}
          >
            <Layout type="list" />
          </ListSection>
          <DetailSection 
            ref={contentRef}
          >
            <Layout type="content" />
          </DetailSection>
        </MainContent>
      </ContentContainer>
    </Container>
  )
}

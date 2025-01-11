import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from './components/Navbar'
import { ShowcaseList } from './components/ShowcaseList'
import { ShowcaseDetail } from './components/ShowcaseDetail'
import { AboutPage } from './components/AboutPage'
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
  padding-top: 6rem;

  @media (max-width: 768px) {
    padding: 1rem;
    padding-bottom: 5rem;
  }
`

const ListSection = styled(motion.div)`
  overflow: hidden;
  @media (max-width: 768px) {
    width: 100%;
    height: auto;
  }
`



const ContentLayer = styled(motion.div)`
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
`

const MainContent = styled(motion.div)`
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
    border-radius: 0;
    border-left: none;
    border-right: none;
  }
`

const DetailSection = styled(motion.div)`
  background-color: #0a1929;
  position: relative;
  min-height: 500px;
  display: flex;  // Add this
  flex-direction: column; // Add this
  
  @media (max-width: 768px) {
    width: 100%;
  }
`

const ContentSlot = styled(motion.div)`
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;  // Add this
`

// Animation variants
const listVariants = {
  expanded: {
    width: "38.2%",
    borderRightWidth: 1,
    borderRightColor: "#1c4c7c",
    transition: { duration: 0.7, ease: "easeInOut" }
  },
  collapsed: {
    width: 0,
    borderRightWidth: 0,
    borderRightColor: "rgba(28, 76, 124, 0)",
    transition: { duration: 0.7, ease: "easeInOut" }
  }
}

const contentVariants = {
  expanded: {
    width: "61.8%",
    transition: { duration: 0.7, ease: "easeInOut" }
  },
  full: {
    width: "100%",
    transition: { duration: 0.7, ease: "easeInOut" }
  }
}

const slotVariants = {
  pageTransition: {
    enter: {
      opacity: 0,
      y: -300,
    },
    center: {
      opacity: 1,
      y: 0,
      transition: {
        y: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: {
      opacity: 0,
      transition: {
        opacity: { duration: 0.7 }  // Match the width transition duration
      }
    }
  },
  itemTransition: {
    enter: { opacity: 0 },
    center: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0,
      transition: { 
        opacity: { duration: 0.7 }  // Match the width transition duration
      }
    }
  }
}

import { ShowcaseItem } from './types/showcase'

export default function App() {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(showcaseItems[0].id)
  const [currentRoute, setCurrentRoute] = useState('PROJECTS')
  
  // Slot management using refs
  const activeSlotIndex = useRef(0)
  const slots = useRef<[React.ReactNode | null, React.ReactNode | null]>([null, null])
  const isTransitioning = useRef(false)

  const selectedItem = selectedItemId 
    ? showcaseItems.find(item => item.id === selectedItemId)
    : null

  const hasListContent = currentRoute === 'PROJECTS'

  const renderContent = () => {
    switch (currentRoute) {
      case 'PROJECTS':
        return selectedItem && (
          <ShowcaseDetail
            item={selectedItem}
            onClose={() => setSelectedItemId(null)}
          />
        )
      case 'RANTS':
        return (
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
      case 'HOME':
        return <AboutPage />
      default:
        return null
    }
  }

  const handlePageChange = (page: string) => {
    if (page === currentRoute || isTransitioning.current) return
    
    // Prepare the inactive slot with new content
    const inactiveSlotIndex = activeSlotIndex.current === 0 ? 1 : 0
    slots.current[inactiveSlotIndex] = renderContent()
    
    // Start transition
    isTransitioning.current = true
    setCurrentRoute(page)
    
    // Update active slot after animation
    setTimeout(() => {
      activeSlotIndex.current = inactiveSlotIndex
      isTransitioning.current = false
    }, 800) // Slightly longer than animation duration to ensure completion
  }

  const handleItemSelect = (id: number) => {
    if (id === selectedItemId) return
    setSelectedItemId(id)
  }

  return (
    <Container>
      <Navbar 
        activePage={currentRoute}
        onPageChange={handlePageChange}
      />
      <ContentContainer>
        <MainContent>
          <ListSection
            initial="collapsed"
            animate={hasListContent ? "expanded" : "collapsed"}
            variants={listVariants}
            style={{ borderRightStyle: 'solid' }}
          >
            <AnimatePresence mode="wait">
              {hasListContent && (
                <ContentSlot
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ShowcaseList
                    items={showcaseItems}
                    onItemSelect={handleItemSelect}
                    isVisible={true}
                  />
                </ContentSlot>
              )}
            </AnimatePresence>
          </ListSection>
          
          <DetailSection
            initial="full"
            animate={hasListContent ? "expanded" : "full"}
            variants={contentVariants}
          >
            <AnimatePresence mode="wait">
              <ContentSlot
                key={currentRoute + selectedItemId}
                variants={isTransitioning.current ? slotVariants.pageTransition : slotVariants.itemTransition}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {renderContent()}
              </ContentSlot>
            </AnimatePresence>
          </DetailSection>
        </MainContent>
      </ContentContainer>
    </Container>
  )
}

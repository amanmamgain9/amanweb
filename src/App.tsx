import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from './components/Navbar'
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { ShowcaseList } from './components/ShowcaseList'
import { ShowcaseDetail } from './components/ShowcaseDetail'
import { AboutPage } from './components/AboutPage'
import { WDYGDTWList, WDYGDTWContent } from './components/WDYGDTWPage'
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
    padding: 0;
    padding-top: 4rem;
  }
`

const ListSection = styled(motion.div)<{ isMobileView?: boolean; showingContent?: boolean }>`
  overflow: hidden;
  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    display: ${props => props.showingContent ? 'none' : 'block'};
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
  height: calc(100vh - 12rem);
  display: flex;
  flex-direction: row;
  background: rgba(10, 25, 41, 0.8);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;

  @media (max-width: 768px) {
    flex-direction: column;
    border-radius: 0;
    height: calc(100vh - 4rem);
    border: none;
  }
`

const DetailSection = styled(motion.div)<{ isMobileView?: boolean; showingContent?: boolean }>`
  background-color: #0a1929;
  position: relative;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  flex: 1;
  
  @media (max-width: 768px) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    min-height: calc(100vh - 4rem);
    transform: translateX(${props => props.showingContent ? '0' : '100%'});
    transition: transform 0.3s ease-in-out;
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


function AppContent() {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768)
  const [showingContent, setShowingContent] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const location = useLocation()
  const navigate = useNavigate()
  const [currentRoute, setCurrentRoute] = useState(location.pathname.slice(1).toUpperCase() || 'HOME')

  useEffect(() => {
    const path = location.pathname.slice(1).toUpperCase() || 'HOME'
    setCurrentRoute(path)
  }, [location])
  
  // Slot management using refs
  const activeSlotIndex = useRef(0)
  const slots = useRef<[React.ReactNode | null, React.ReactNode | null]>([null, null])
  const isTransitioning = useRef(false)

  const selectedItem = selectedItemId 
    ? showcaseItems.find(item => item.title === selectedItemId)
    : null

  const hasListContent = ['PROJECTS', 'WDYGDTW'].includes(currentRoute)

  const renderList = () => {
    switch (currentRoute) {
      case 'PROJECTS':
        return (
          <ShowcaseList
            items={showcaseItems}
            onItemSelect={handleItemSelect}
            isVisible={true}
          />
        )
      case 'WDYGDTW':
        return (
          <WDYGDTWList
            onWeekSelect={handleItemSelect}
          />
        )
      default:
        return null
    }
  }

  const renderContent = () => {
    switch (currentRoute) {
      case 'PROJECTS':
        return selectedItem && (
          <ShowcaseDetail
            item={selectedItem}
            onClose={() => setSelectedItemId(null)}
          />
        )
      case 'HOME':
        return <AboutPage />
      case 'WDYGDTW':
        return <WDYGDTWContent weekId={selectedItemId ? parseInt(selectedItemId) : 1} />
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
    navigate(`/${page.toLowerCase()}`)
    
    // Update active slot after animation
    setTimeout(() => {
      activeSlotIndex.current = inactiveSlotIndex
      isTransitioning.current = false
    }, 800)
  }

  const handleItemSelect = (id: number) => {
    if (id === selectedItemId) return
    setSelectedItemId(id.toString())
    if (isMobileView) {
      setShowingContent(true)
    }
  }

  const handleBackToList = () => {
    if (isMobileView) {
      setShowingContent(false)
    }
  }

  return (
    <Routes>
      <Route path="*" element={
        <Container>
      <Navbar 
        activePage={currentRoute}
        onPageChange={handlePageChange}
      />
      <ContentContainer>
        <MainContent>
          <ListSection
            initial="collapsed"
            animate={hasListContent && !isMobileView ? "expanded" : "collapsed"}
            variants={listVariants}
            style={{ borderRightStyle: 'solid' }}
            isMobileView={isMobileView}
            showingContent={showingContent}
          >
            <AnimatePresence mode="wait">
              {hasListContent && (
                <ContentSlot
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {renderList()}
                </ContentSlot>
              )}
            </AnimatePresence>
          </ListSection>
          
          <DetailSection
            initial="full"
            animate={hasListContent && !isMobileView ? "expanded" : "full"}
            variants={contentVariants}
            isMobileView={isMobileView}
            showingContent={showingContent}
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
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

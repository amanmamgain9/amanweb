import { useState } from 'react'
import { TopBar } from './components/TopBar'
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
  font-family: 'Share Tech Mono', monospace;
`

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  gap: 1rem;
  overflow-y: auto;
  padding: 0 1rem;
`

export default function App() {
  const [activePage, setActivePage] = useState('PROJECTS')
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)

  const selectedItem = selectedItemId 
    ? showcaseItems.find(item => item.id === selectedItemId)
    : null

  const handlePageChange = (page: string) => {
    setActivePage(page)
  }

  return (
    <Container>
      <TopBar 
        title="DEVELOPER SHOWCASE"
        activePage={activePage}
        onPageChange={handlePageChange}
      />
      
      <ContentContainer>
        {activePage === 'PROJECTS' && (
          <MainContent>
            <ShowcaseList
              items={showcaseItems}
              onItemSelect={setSelectedItemId}
            />

            {selectedItem && (
              <ShowcaseDetail
                item={selectedItem}
                onClose={() => setSelectedItemId(null)}
              />
            )}
          </MainContent>
        )}
      </ContentContainer>
    </Container>
  )
}

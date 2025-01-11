import styled from 'styled-components'

const Container = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
`

const Image = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 240, 255, 0.1);
`

const Title = styled.h1`
  color: #00f0ff;
  text-align: center;
  font-size: 2em;
  margin-bottom: 1rem;
`

export function WDYGDTWPage() {
  return (
    <Container>
      <Title>What Did You Get Done This Week?</Title>
      <Image src="/wdygdtw.jpeg" alt="WDYGDTW" />
    </Container>
  )
}

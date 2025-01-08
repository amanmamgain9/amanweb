import { useState } from 'react'
import './styles/Raffle.css'

function App() {
  const [activeTab, setActiveTab] = useState('all')
  const [pointsBalance] = useState(727007)

  const raffles = [
    {
      id: 1,
      title: '5 AMATERASU WL SPOTS',
      description: 'Launching on Aptos chain, an upcoming collection of 10,000 NFTs based on the DN404 standard. Stand a chance to participate in the fair launch of their collection by winning a spot! You must have a Petra wallet address to be able to claim the whitelist spot, GL!',
      status: 'ENDED',
      tickets: 0,
      logo: '/path-to-logo.png'
    },
    {
      id: 2,
      title: '15 TOKYO BEAST SILVER MYSTERY TICKETS',
      description: 'A crypto entertainment IP project centered on Web3 games.',
      status: 'ENDED',
      tickets: 1,
      result: 'YOU LOST',
      logo: '/path-to-logo.png'
    },
    {
      id: 3,
      title: '10 TOKYO BEAST GOLDEN MYSTERY TICKETS',
      description: 'A crypto entertainment IP project centered on Web3 games.',
      status: 'ENDED',
      tickets: 1,
      result: 'YOU LOST',
      logo: '/path-to-logo.png'
    }
  ]

  return (
    <div className="raffle-container">
      <div className="header">
        <div>ALL RAFFLES 10</div>
        <div className="points-balance">POINTS BALANCE {pointsBalance} +</div>
      </div>

      <div className="tab-container">
        <button 
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          ALL RAFFLES
        </button>
        <button 
          className={`tab-button ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          MY ENTRIES
        </button>
      </div>

      <div className="raffles-list">
        {raffles.map(raffle => (
          <div key={raffle.id} className="raffle-card">
            <div className="raffle-header">
              <div className="raffle-title">{raffle.title}</div>
              <img src={raffle.logo} alt="Raffle logo" className="raffle-logo" />
            </div>
            <div className="raffle-description">{raffle.description}</div>
            <div className="ticket-controls">
              <div>ENDED</div>
              <div>YOUR TICKETS</div>
              <button className="ticket-button">-</button>
              <span>{raffle.tickets}</span>
              <button className="ticket-button">+</button>
              {raffle.result && <div className="status-label">{raffle.result}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App

import { useState } from 'react'
import './styles/Raffle.css'

function App() {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedItem, setSelectedItem] = useState<number | null>(null)

  const showcaseItems = [
    {
      id: 1,
      category: 'project',
      title: 'Project Name 1',
      description: 'Description of your project',
      technologies: ['React', 'TypeScript', 'CSS'],
      link: 'https://project-link.com',
      image: '/path-to-project-image.png'
    },
    {
      id: 2,
      category: 'article',
      title: 'Article Title',
      description: 'Brief description of the article',
      date: '2023-12-01',
      link: 'https://article-link.com',
      image: '/path-to-article-image.png'
    },
    {
      id: 3,
      category: 'thought',
      title: 'Interesting Thought',
      description: 'Your thoughts on a particular topic',
      date: '2023-12-05',
      image: '/path-to-thought-image.png'
    }
  ]

  return (
    <div className="showcase-container">
      <div className="topbar">
        <div className="topbar-title">
          <span>MY SHOWCASE</span>
          <span className="title-decoration">////</span>
        </div>
      </div>

      <div className="main-content">
        <div className="tab-container">
          <button 
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            ALL
          </button>
          <button 
            className={`tab-button ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            PROJECTS
          </button>
          <button 
            className={`tab-button ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            ARTICLES
          </button>
          <button 
            className={`tab-button ${activeTab === 'thoughts' ? 'active' : ''}`}
            onClick={() => setActiveTab('thoughts')}
          >
            THOUGHTS
          </button>
        </div>

        <div className="showcase-list">
          {showcaseItems
            .filter(item => activeTab === 'all' || item.category === activeTab)
            .map(item => (
              <div 
                key={item.id} 
                className="showcase-card"
                onClick={() => setSelectedItem(item.id)}
              >
                <div className="showcase-header">
                  <div className="showcase-title">{item.title}</div>
                  <img src={item.image} alt={item.title} className="showcase-image" />
                </div>
                <div className="showcase-description">{item.description}</div>
                {item.technologies && (
                  <div className="technologies">
                    {item.technologies.map(tech => (
                      <span key={tech} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>

        {selectedItem && (
          <div className="showcase-detail">
            <button 
              className="close-button"
              onClick={() => setSelectedItem(null)}
            >
              ✕
            </button>
            {(() => {
              const item = showcaseItems.find(i => i.id === selectedItem)
              return (
                <>
                  <img src={item?.image} alt={item?.title} className="showcase-image" />
                  <h2>{item?.title}</h2>
                  <p>{item?.description}</p>
                  {item?.technologies && (
                    <div className="technologies">
                      {item.technologies.map(tech => (
                        <span key={tech} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  )}
                  {item?.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="item-link">
                      View {item.category}
                    </a>
                  )}
                </>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

export default App

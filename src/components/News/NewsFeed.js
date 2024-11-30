import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const NewsContainer = styled.div`
  padding: ${props => props.theme.spacing.grid};
  background: ${props => props.theme.colors.surface};
  border-radius: 4px;
`;

const NewsCard = styled.div`
  padding: 15px;
  background: ${props => props.theme.colors.background};
  border-radius: 4px;
  margin-bottom: 10px;
  cursor: pointer;
  
  &:hover {
    background: ${props => props.theme.colors.surface};
  }
`;

const NewsTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: ${props => props.theme.typography.sizes.body};
`;

const NewsMetadata = styled.div`
  font-size: ${props => props.theme.typography.sizes.small};
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  justify-content: space-between;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 15px;
  border-bottom: 1px solid ${props => props.theme.colors.background};
`;

const Tab = styled.div`
  padding: 10px 20px;
  cursor: pointer;
  ${props => props.active && `
    border-bottom: 2px solid ${props.theme.colors.primary};
    color: ${props.theme.colors.primary};
  `}
`;

const NewsFeed = ({ symbols = [] }) => {
  const [news, setNews] = useState([]);
  const [activeTab, setActiveTab] = useState('market'); // 'market' or 'portfolio'

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const symbolsQuery = activeTab === 'portfolio' && symbols.length > 0
          ? `&symbols=${symbols.join(',')}`
          : '';

        const response = await fetch(
          `https://query1.finance.yahoo.com/v2/finance/news?region=IN${symbolsQuery}`
        );
        const data = await response.json();
        setNews(data.items || []);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchNews();
    const intervalId = setInterval(fetchNews, 300000); // Refresh every 5 minutes

    return () => clearInterval(intervalId);
  }, [symbols, activeTab]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <NewsContainer>
      <h2>Market News</h2>
      
      <TabContainer>
        <Tab 
          active={activeTab === 'market'} 
          onClick={() => setActiveTab('market')}
        >
          Market News
        </Tab>
        <Tab 
          active={activeTab === 'portfolio'} 
          onClick={() => setActiveTab('portfolio')}
        >
          Portfolio News
        </Tab>
      </TabContainer>

      {news.map((item, index) => (
        <NewsCard 
          key={index}
          onClick={() => window.open(item.link, '_blank')}
        >
          <NewsTitle>{item.title}</NewsTitle>
          <NewsMetadata>
            <span>{item.publisher}</span>
            <span>{formatDate(item.published_at)}</span>
          </NewsMetadata>
        </NewsCard>
      ))}
    </NewsContainer>
  );
};

export default NewsFeed; 
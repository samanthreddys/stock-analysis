import React from 'react';
import styled from 'styled-components';

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-gap: ${props => props.theme.spacing.grid};
  padding: ${props => props.theme.spacing.grid};
  background-color: ${props => props.theme.colors.background};
  min-height: 100vh;
`;

const Dashboard = ({ children }) => {
  return (
    <DashboardGrid>
      {children}
    </DashboardGrid>
  );
};

export default Dashboard; 
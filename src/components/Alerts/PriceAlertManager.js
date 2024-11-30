import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import yahooFinanceService from '../../services/yahooFinanceAPI';

const AlertContainer = styled.div`
  padding: ${props => props.theme.spacing.grid};
  background: ${props => props.theme.colors.surface};
  border-radius: 4px;
`;

const AlertForm = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
`;

const AlertList = styled.div`
  display: grid;
  gap: 10px;
`;

const AlertCard = styled.div`
  padding: 12px;
  background: ${props => props.theme.colors.background};
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PriceAlertManager = () => {
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    targetPrice: '',
    condition: 'above', // 'above' or 'below'
  });

  useEffect(() => {
    // Load saved alerts
    const savedAlerts = localStorage.getItem('priceAlerts');
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }

    // Set up alert checking interval
    const checkAlerts = async () => {
      for (const alert of alerts) {
        try {
          const quote = await yahooFinanceService.getStockQuote(alert.symbol);
          const currentPrice = quote.regularMarketPrice;

          if ((alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
              (alert.condition === 'below' && currentPrice <= alert.targetPrice)) {
            // Trigger notification
            new Notification(`Price Alert: ${alert.symbol}`, {
              body: `Price ${alert.condition} ₹${alert.targetPrice}`,
              icon: '/logo.png'
            });
            
            // Remove triggered alert
            setAlerts(prev => prev.filter(a => a.id !== alert.id));
          }
        } catch (error) {
          console.error('Error checking alert:', error);
        }
      }
    };

    const intervalId = setInterval(checkAlerts, 60000); // Check every minute
    return () => clearInterval(intervalId);
  }, [alerts]);

  const addAlert = (e) => {
    e.preventDefault();
    const alert = {
      ...newAlert,
      id: Date.now(),
      targetPrice: Number(newAlert.targetPrice)
    };
    setAlerts([...alerts, alert]);
    localStorage.setItem('priceAlerts', JSON.stringify([...alerts, alert]));
    setNewAlert({ symbol: '', targetPrice: '', condition: 'above' });
  };

  return (
    <AlertContainer>
      <h2>Price Alerts</h2>
      <AlertForm onSubmit={addAlert}>
        <input
          placeholder="Stock Symbol"
          value={newAlert.symbol}
          onChange={(e) => setNewAlert({...newAlert, symbol: e.target.value})}
          required
        />
        <input
          type="number"
          placeholder="Target Price"
          value={newAlert.targetPrice}
          onChange={(e) => setNewAlert({...newAlert, targetPrice: e.target.value})}
          required
        />
        <select
          value={newAlert.condition}
          onChange={(e) => setNewAlert({...newAlert, condition: e.target.value})}
        >
          <option value="above">Above</option>
          <option value="below">Below</option>
        </select>
        <button type="submit">Add Alert</button>
      </AlertForm>
      <AlertList>
        {alerts.map(alert => (
          <AlertCard key={alert.id}>
            <div>{alert.symbol}</div>
            <div>{alert.targetPrice}</div>
            <div>{alert.condition}</div>
          </AlertCard>
        ))}
      </AlertList>
    </AlertContainer>
  );
};

export default PriceAlertManager; 
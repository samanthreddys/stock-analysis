import React, { useEffect } from 'react';
import { LineSeries } from 'lightweight-charts';

const calculateSMA = (data, period) => {
  const sma = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b.close, 0);
    sma.push({
      time: data[i].time,
      value: sum / period
    });
  }
  return sma;
};

const calculateRSI = (data, period = 14) => {
  const rsi = [];
  let gains = 0;
  let losses = 0;

  // Calculate initial average gain/loss
  for (let i = 1; i < period; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change >= 0) gains += change;
    else losses -= change;
  }

  gains /= period;
  losses /= period;

  // Calculate RSI for remaining data
  for (let i = period; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains = (gains * (period - 1) + (change > 0 ? change : 0)) / period;
    losses = (losses * (period - 1) + (change < 0 ? -change : 0)) / period;

    const rs = gains / losses;
    rsi.push({
      time: data[i].time,
      value: 100 - (100 / (1 + rs))
    });
  }

  return rsi;
};

const TechnicalIndicators = ({ chart, data }) => {
  useEffect(() => {
    if (!chart || !data) return;

    // Add SMA lines
    const sma20 = chart.addLineSeries({
      color: '#2962FF',
      lineWidth: 1,
      title: 'SMA 20'
    });
    sma20.setData(calculateSMA(data, 20));

    const sma50 = chart.addLineSeries({
      color: '#FF6D00',
      lineWidth: 1,
      title: 'SMA 50'
    });
    sma50.setData(calculateSMA(data, 50));

    // Add RSI
    const rsiSeries = chart.addLineSeries({
      color: '#E91E63',
      lineWidth: 1,
      title: 'RSI (14)',
      priceScaleId: 'rsi',
      pane: 1
    });
    rsiSeries.setData(calculateRSI(data));

    return () => {
      chart.removeSeries(sma20);
      chart.removeSeries(sma50);
      chart.removeSeries(rsiSeries);
    };
  }, [chart, data]);

  return null;
};

export default TechnicalIndicators; 
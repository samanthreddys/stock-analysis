import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { createChart, CrosshairMode } from 'lightweight-charts';

const ChartContainer = styled.div`
  height: 400px;
  width: 100%;
  background: ${props => props.theme.colors.surface};
  border-radius: 4px;
`;

const StockChart = ({ symbol, exchange = 'NSE' }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();

  useEffect(() => {
    // Create chart instance
    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: '#1C1C28' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      timeScale: {
        borderColor: '#2B2B43',
      },
    });

    // Add candlestick series
    const candlestickSeries = chartRef.current.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    // Fetch and load data
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.${exchange}?interval=1d&range=1y`
        );
        const data = await response.json();
        
        const chartData = data.chart.result[0].indicators.quote[0].close.map((close, index) => ({
          time: data.chart.result[0].timestamp[index],
          open: data.chart.result[0].indicators.quote[0].open[index],
          high: data.chart.result[0].indicators.quote[0].high[index],
          low: data.chart.result[0].indicators.quote[0].low[index],
          close: close,
        }));

        candlestickSeries.setData(chartData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchData();

    // Handle resize
    const handleResize = () => {
      chartRef.current.applyOptions({
        width: chartContainerRef.current.clientWidth
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartRef.current.remove();
    };
  }, [symbol, exchange]);

  return <ChartContainer ref={chartContainerRef} />;
};

export default StockChart; 
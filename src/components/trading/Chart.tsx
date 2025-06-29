import React, { useEffect, useRef, useState, useCallback, FC } from 'react';
import { 
  createChart, 
  IChartApi, 
  ISeriesApi, 
  MouseEventParams, 
  DeepPartial, 
  SeriesType, 
  SeriesOptionsMap, 
  CandlestickData, 
  HistogramData, 
  LineData,
  CandlestickSeriesOptions,
  HistogramSeriesOptions,
  LineSeriesOptions,
  PriceScaleOptions,
  LayoutOptions,
  Time,
  UTCTimestamp,
  WhitespaceData,
  LineStyle,
  LineWidth,
  Logical,
  LineSeries,
  HistogramSeries,
  CandlestickSeries
} from 'lightweight-charts';
import { CandlestickData as TradingViewCandlestickData } from 'lightweight-charts';
import { calculateSMA, calculateEMA, calculateRSI, calculateBollingerBands, calculateMACD } from '../../lib/analysis/indicators';
import { measureFunction } from '../../utils/performance/monitor';

// Chart props
// Define the chart data type that includes all required properties
export interface ChartData {
  time: number | UTCTimestamp;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  color?: string;
  borderColor?: string;
  wickColor?: string;
}

export interface ChartProps {
  symbol: string;
  data: ChartData[];
  width?: number | string;
  height?: number;
  timeframe?: string;
  indicators?: {
    sma?: { periods: number[] };
    ema?: { periods: number[] };
    rsi?: { period: number };
    macd?: { fast: number; slow: number; signal: number };
    bollinger?: { period: number; stdDev: number };
  };
  theme?: 'light' | 'dark';
  onCrosshairMove?: (param: { time: number; price: number }) => void;
  onVisibleTimeRangeChange?: (range: { from: number; to: number }) => void;
}

/**
 * Trading chart component using lightweight-charts
 */
export const Chart: React.FC<ChartProps> = ({
  symbol,
  data = [],
  width = '100%',
  height = 500,
  timeframe = '1d',
  indicators = {},
  theme = 'dark',
  onCrosshairMove,
  onVisibleTimeRangeChange,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const [currentColors, setCurrentColors] = useState({
    upCandle: theme === 'dark' ? '#26a69a' : '#26a69a',
    downCandle: theme === 'dark' ? '#ef5350' : '#ef5350',
    volume: theme === 'dark' ? 'rgba(38, 166, 154, 0.5)' : 'rgba(38, 166, 154, 0.5)',
    background: theme === 'dark' ? '#1e222d' : '#ffffff',
    text: theme === 'dark' ? '#d1d4dc' : '#000000',
    grid: theme === 'dark' ? '#2b2b43' : '#f0f3fa',
    // Indicator colors
    sma: '#2962FF',
    ema: '#FF6D00',
    rsi: '#7E57C2',
    macdLine: '#00B8D9',
    signalLine: '#FF6D00',
    bollingerMiddle: '#7E57C2',
    bollingerBands: '#26A69A',
  } as const);
  const indicatorSeriesRefs = useRef<Map<string, ISeriesApi<SeriesType>>>(new Map());

  const [isLoading, setIsLoading] = useState(true);

  const colors = {
    light: {
      background: '#FFFFFF',
      text: '#191919',
      grid: '#F0F3FA',
      upCandle: '#26A69A',
      downCandle: '#EF5350',
      volume: '#26a69a80',
      sma: '#2962FF',
      ema: '#B71C1C',
      rsi: '#7B1FA2',
      macdLine: '#2962FF',
      signalLine: '#FF6D00',
      histogram: '#26A69A',
      bollingerMiddle: '#2962FF',
      bollingerBands: '#2962FF50',
    },
    dark: {
      background: '#131722',
      text: '#D9D9D9',
      grid: '#2A2E39',
      upCandle: '#26A69A',
      downCandle: '#EF5350',
      volume: '#26a69a80',
      sma: '#2962FF',
      ema: '#FF6D00',
      rsi: '#AB47BC',
      macdLine: '#2962FF',
      signalLine: '#FF6D00',
      histogram: '#26A69A',
      bollingerMiddle: '#2962FF',
      bollingerBands: '#2962FF50',
    },
  };

  // Define the chart data type that includes all required properties
  interface ChartData {
    time: number | UTCTimestamp;
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    color?: string;
    borderColor?: string;
    wickColor?: string;
  }

  const updateChartData = useCallback((newData: ChartData[]) => {
    if (!chartInstanceRef.current || !candlestickSeriesRef.current || !volumeSeriesRef.current) {
      return;
    }

    setIsLoading(true);

    const candlestickData: CandlestickData<Time>[] = newData.map(d => ({
      time: (typeof d.time === 'number' ? d.time / 1000 : d.time) as UTCTimestamp,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    const volumeData: HistogramData<Time>[] = newData.map(d => ({
      time: (typeof d.time === 'number' ? d.time / 1000 : d.time) as UTCTimestamp,
      value: d.volume || 0,
      color: d.close >= d.open ? currentColors.upCandle : currentColors.downCandle,
    }));

    candlestickSeriesRef.current.setData(candlestickData);
    volumeSeriesRef.current.setData(volumeData);

    indicatorSeriesRefs.current.forEach((series) => chartInstanceRef.current!.removeSeries(series));
    indicatorSeriesRefs.current.clear();

    if (indicators.sma?.periods) {
      for (const period of indicators.sma.periods) {
        const smaData = calculateSMA(newData, period);
        const smaLineData = smaData.filter(d => d.value).map(d => ({
          time: (d.timestamp / 1000) as UTCTimestamp,
          value: d.value!
        }));
        const smaSeries = chartInstanceRef.current!.addSeries(LineSeries, {
          color: currentColors.sma,
          lineWidth: 1 as LineWidth,
          lastValueVisible: false,
          title: `SMA ${period}`,
          visible: true,
          priceLineVisible: false,
        });
        smaSeries.setData(smaLineData);
        indicatorSeriesRefs.current.set(`sma-${period}`, smaSeries);
      }
    }

    if (indicators.ema?.periods) {
      for (const period of indicators.ema.periods) {
        const emaData = calculateEMA(newData, period);
        const emaLineData = emaData.filter(d => d.value).map(d => ({
          time: (d.timestamp / 1000) as UTCTimestamp,
          value: d.value!
        }));
        const emaSeries = chartInstanceRef.current!.addSeries(LineSeries, {
          color: currentColors.ema,
          lineWidth: 1 as LineWidth,
          lastValueVisible: false,
          title: `EMA ${period}`,
          visible: true,
          priceLineVisible: false,
        });
        emaSeries.setData(emaLineData);
        indicatorSeriesRefs.current.set(`ema-${period}`, emaSeries);
      }
    }

    if (indicators.rsi?.period) {
      const rsiData = calculateRSI(newData, indicators.rsi.period);
      const rsiLineData = rsiData.filter(d => d.value).map(d => ({
        time: (d.timestamp / 1000) as UTCTimestamp,
        value: d.value!
      }));
      const rsiSeries = chartInstanceRef.current!.addSeries(LineSeries, {
        color: currentColors.rsi,
        lineWidth: 1 as LineWidth,
        priceScaleId: 'rsi',
        lastValueVisible: false,
        title: 'RSI',
        visible: true,
        priceLineVisible: false,
      });
      rsiSeries.setData(rsiLineData);
      indicatorSeriesRefs.current.set('rsi', rsiSeries);
    }

    if (indicators.macd) {
      const { fast, slow, signal } = indicators.macd;
      const macdData = calculateMACD(newData, fast, slow, signal);
      const macdLineData = macdData.filter(d => d.value).map(d => ({
        time: (d.timestamp / 1000) as UTCTimestamp,
        value: (d.value as number[])[0]
      }));
      const signalLineData = macdData.filter(d => d.value).map(d => ({
        time: (d.timestamp / 1000) as UTCTimestamp,
        value: (d.value as number[])[1]
      }));
      const histogramData = macdData.filter(d => d.value).map(d => ({
        time: (d.timestamp / 1000) as UTCTimestamp,
        value: (d.value as number[])[2],
        color: (d.value as number[])[2] >= 0 ? currentColors.upCandle : currentColors.downCandle
      }));

      const macdLineSeries = chartInstanceRef.current!.addSeries(LineSeries, {
        color: currentColors.macdLine,
        lineWidth: 1 as LineWidth,
        priceScaleId: 'macd',
        lastValueVisible: false,
        title: 'MACD',
        visible: true,
        priceLineVisible: false,
      });
      macdLineSeries.setData(macdLineData.map(d => ({
        time: (d.time as number) / 1000 as UTCTimestamp,
        value: d.value
      })));
      indicatorSeriesRefs.current.set('macd-line', macdLineSeries);

      const signalLineSeries = chartInstanceRef.current!.addSeries(LineSeries, {
        color: currentColors.signalLine,
        lineWidth: 1 as LineWidth,
        priceScaleId: 'macd',
        lastValueVisible: false,
        title: 'Signal',
        visible: true,
        priceLineVisible: false,
      });
      signalLineSeries.setData(signalLineData.map(d => ({
        time: (d.time as number) / 1000 as UTCTimestamp,
        value: d.value
      })));
      indicatorSeriesRefs.current.set('macd-signal', signalLineSeries);

      const histogramSeries = chartInstanceRef.current!.addSeries(HistogramSeries, {
        priceScaleId: 'macd',
        lastValueVisible: false,
        title: 'MACD Hist',
        visible: true,
        priceLineVisible: false,
      });
      histogramSeries.setData(histogramData.map(d => ({
        time: (d.time as number) / 1000 as UTCTimestamp,
        value: d.value,
        color: d.color
      })));
      indicatorSeriesRefs.current.set('macd-histogram', histogramSeries);
    }

    if (indicators.bollinger) {
      const { period, stdDev } = indicators.bollinger;
      const bbData = calculateBollingerBands(newData, period, stdDev);
      const middleBandData = bbData.filter(d => d.value).map(d => ({
        time: (d.timestamp / 1000) as UTCTimestamp,
        value: (d.value as number[])[0]
      }));
      const upperBandData = bbData.filter(d => d.value).map(d => ({
        time: (d.timestamp / 1000) as UTCTimestamp,
        value: (d.value as number[])[1]
      }));
      const lowerBandData = bbData.filter(d => d.value).map(d => ({
        time: (d.timestamp / 1000) as UTCTimestamp,
        value: (d.value as number[])[2]
      }));

      const middleBandSeries = chartInstanceRef.current!.addSeries(LineSeries, {
        color: currentColors.bollingerMiddle,
        lineWidth: 1 as LineWidth,
        lastValueVisible: false,
        title: `BB Middle (${period})`,
        visible: true,
        priceLineVisible: false,
      });
      middleBandSeries.setData(middleBandData.map(d => ({
        time: (d.time as number) / 1000 as UTCTimestamp,
        value: d.value
      })));
      indicatorSeriesRefs.current.set(`bb-middle-${period}`, middleBandSeries);

      const upperBandSeries = chartInstanceRef.current!.addSeries(LineSeries, {
        color: currentColors.bollingerBands,
        lineWidth: 1 as LineWidth,
        lastValueVisible: false,
        title: `BB Upper (${period})`,
        visible: true,
        priceLineVisible: false,
      });
      upperBandSeries.setData(upperBandData.map(d => ({
        time: (d.time as number) / 1000 as UTCTimestamp,
        value: d.value
      })));
      indicatorSeriesRefs.current.set(`bb-upper-${period}`, upperBandSeries);

      const lowerBandSeries = chartInstanceRef.current!.addSeries(LineSeries, {
        color: currentColors.bollingerBands,
        lineWidth: 1 as LineWidth,
        lastValueVisible: false,
        title: `BB Lower (${period})`,
        visible: true,
        priceLineVisible: false,
      });
      lowerBandSeries.setData(lowerBandData.map(d => ({
        time: (d.time as number) / 1000 as UTCTimestamp,
        value: d.value
      })));
      indicatorSeriesRefs.current.set(`bb-lower-${period}`, lowerBandSeries);
    }

    chartInstanceRef.current?.timeScale().fitContent();
  }, [indicators, currentColors]);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      width: typeof width === 'number' ? width : 800,
      height: typeof height === 'number' ? height : 500,
      layout: {
        background: { color: currentColors.background },
        textColor: currentColors.text,
      } as Partial<LayoutOptions>,
      grid: {
        vertLines: { color: currentColors.grid },
        horzLines: { color: currentColors.grid },
      },
    });

    chartInstanceRef.current = chart;

    const rsiScale = chart.priceScale('rsi');
    if (rsiScale) {
      rsiScale.applyOptions({
        scaleMargins: {
          top: 0.7,
          bottom: 0,
        },
      } as DeepPartial<PriceScaleOptions>);
    }

    const macdScale = chart.priceScale('macd');
    if (macdScale) {
      macdScale.applyOptions({
        scaleMargins: {
          top: 0.7,
          bottom: 0.1,
        },
      } as DeepPartial<PriceScaleOptions>);
    }

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: currentColors.upCandle,
      downColor: currentColors.downCandle,
      borderVisible: false,
      wickUpColor: currentColors.upCandle,
      wickDownColor: currentColors.downCandle,
    });
    candlestickSeriesRef.current = candlestickSeries;

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: currentColors.volume,
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      lastValueVisible: false,
      title: 'Volume',
      visible: true,
      priceLineVisible: false,
      priceLineWidth: 1 as LineWidth,
      priceLineStyle: LineStyle.Solid,
      baseLineVisible: false,
    });

    if (onCrosshairMove) {
      chart.subscribeCrosshairMove((param: MouseEventParams) => {
        if (!param.time || !candlestickSeriesRef.current) return;
        
        // Handle different time types (number or UTCTimestamp)
        const timeValue = typeof param.time === 'number' 
          ? param.time 
          : (param.time as unknown as { timestamp: number }).timestamp;
        
        // Get the price data from the series
        const priceData = param.seriesData.get(candlestickSeriesRef.current) as TradingViewCandlestickData;
        
        if (priceData) {
          onCrosshairMove({ 
            time: timeValue * 1000, // Convert to milliseconds
            price: priceData.close 
          });
        }
      });
    }

    if (onVisibleTimeRangeChange) {
      chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (!range) return;
        
        // Convert logical coordinates to timestamps
        const fromTime = chart.timeScale().coordinateToLogical(range.from);
        const toTime = chart.timeScale().coordinateToLogical(range.to);
        
        if (fromTime !== null && toTime !== null) {
          // Convert to milliseconds and ensure we have valid numbers
          const fromTimestamp = (fromTime as number) * 1000;
          const toTimestamp = (toTime as number) * 1000;
          
          onVisibleTimeRangeChange({
            from: fromTimestamp,
            to: toTimestamp,
          });
        }
      });
    }

    if (data.length > 0) {
      const formattedData = data.map(d => ({
        ...d,
        time: (d.time as number) / 1000 as UTCTimestamp,
        timestamp: d.time as number,
      }));
      updateChartData(formattedData);
    }

    return () => {
      chart.remove();
      chartInstanceRef.current = null;
    };
  }, [width, height, theme, onCrosshairMove, onVisibleTimeRangeChange, currentColors, data, updateChartData]);

  useEffect(() => {
    if (chartInstanceRef.current && data.length > 0) {
      updateChartData(data);
    }
  }, [data, updateChartData]);

  return (
    <div className="relative w-full h-full">
      <div ref={chartRef} style={{ width, height }} />
      {!data.length && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default Chart;

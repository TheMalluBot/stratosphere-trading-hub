
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ConfigurationFormProps {
  symbol: string;
  setSymbol: (value: string) => void;
  timeframe: string;
  setTimeframe: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  initialCapital: string;
  setInitialCapital: (value: string) => void;
}

export const ConfigurationForm = ({
  symbol,
  setSymbol,
  timeframe,
  setTimeframe,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  initialCapital,
  setInitialCapital
}: ConfigurationFormProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label>Symbol</Label>
        <Select value={symbol} onValueChange={setSymbol}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="RELIANCE">Reliance Industries</SelectItem>
            <SelectItem value="TCS">Tata Consultancy Services</SelectItem>
            <SelectItem value="NIFTY50">NIFTY 50</SelectItem>
            <SelectItem value="BTCUSDT">Bitcoin/USDT</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Timeframe</Label>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">1 Minute</SelectItem>
            <SelectItem value="5m">5 Minutes</SelectItem>
            <SelectItem value="15m">15 Minutes</SelectItem>
            <SelectItem value="1H">1 Hour</SelectItem>
            <SelectItem value="1D">1 Day</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>End Date</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Initial Capital (₹)</Label>
        <Input
          type="number"
          placeholder="100000"
          value={initialCapital}
          onChange={(e) => setInitialCapital(e.target.value)}
        />
      </div>
    </>
  );
};

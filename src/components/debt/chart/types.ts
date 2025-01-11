export interface ChartData {
  [key: string]: string | number;
  date: string;
  monthLabel: string;
  month: number;
  Total: number;
  oneTimeFunding: number;
}

export interface GradientDefinition {
  id: string;
  startColor: string;
  endColor: string;
  opacity: {
    start: number;
    end: number;
  };
}
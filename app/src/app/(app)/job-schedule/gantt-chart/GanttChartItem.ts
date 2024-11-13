
export type GanttChartEvent = {
  id: string;
  days: number;
  startDate: Date;
  onChange: (event: { days?: number; startDate?: Date }) => void;
  children: React.ReactNode;
};

export type GanttChartItem = {
  label: React.ReactNode;
  events: GanttChartEvent[];
};
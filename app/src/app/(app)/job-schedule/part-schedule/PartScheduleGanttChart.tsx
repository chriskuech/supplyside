"use client";

import { Box, Stack } from "@mui/material";
import GanttChart from "../gantt-chart/GanttChart";
import { PartModel } from "./PartModel";

export const PartScheduleGanttChart = ({ parts }: { parts: PartModel[] }) => (
  <GanttChart
    drawerHeader="Gantt chart header"
    stageHeader="stage header"
    headerHeight={200}
    items={parts.map((part) => ({
      label: <Stack width={"100%"} height={"100%"}>{part.name}</Stack>,
      events: [
        ...part.steps.flatMap((step) => {
          if (!step.start || !step.days) return [];

          return {
            id: step.id,
            days: step.days,
            startDate: step.start,
            onChange: () => { },
            children: (
              <Box height={"100%"} width={"100%"} sx={{ background: "blue" }}>
                {step.name}
              </Box>
            ),
          };
        }),
      ],
    }))}
  />
);

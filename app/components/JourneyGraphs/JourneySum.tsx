import { FunctionComponent } from "react";
import { LineChart, Line, XAxis } from "recharts";

interface Props {
  journeySummary: { month: string; sum: number }[];
}

export const JourneySum: FunctionComponent<Props> = ({ journeySummary }) => {
  return (
    <div className="bg-blue-500 rounded-md p-4">
      <LineChart data={journeySummary} width={300} height={200}>
        <Line type="monotone" dataKey="sum" />
        <XAxis dataKey="month" />
      </LineChart>
    </div>
  );
};

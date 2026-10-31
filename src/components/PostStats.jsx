import { useQuery } from "@tanstack/react-query"
import { VictoryAxis, VictoryBar, VictoryChart } from "victory"
import { fetchDailyViews, fetchTotalViews } from "../api"
import { FormError } from "./FormBits"

// currentColor / CSS vars so the chart follows the light/dark theme on <html>.
const axisStyle = {
  axis: { stroke: "var(--border)" },
  grid: { stroke: "var(--border)" },
  tickLabels: { fill: "currentColor", fontSize: 10, padding: 4 },
}

export default function PostStats({ postId }) {
  const total = useQuery({ queryKey: ["totalViews", postId], queryFn: () => fetchTotalViews(postId) })
  const daily = useQuery({ queryKey: ["dailyViews", postId], queryFn: () => fetchDailyViews(postId) })
  const error = total.error || daily.error

  return (
    <section className="border-t-4 border-primary pt-6 text-foreground">
      <h2 className="mb-2 font-display text-3xl font-bold">Stats</h2>
      <FormError message={error && `Couldn’t load stats: ${error.message}`} />
      <p className="text-lg">
        Total views: <strong data-testid="total-views">{total.data?.views ?? "…"}</strong>
      </p>
      {daily.data?.length > 0 && (
        <VictoryChart
          domainPadding={20}
          height={250}
          title="Daily views"
          desc={daily.data.map((d) => `${d.date}: ${d.views}`).join(", ")}
        >
          <VictoryAxis fixLabelOverlap style={axisStyle} />
          <VictoryAxis dependentAxis tickFormat={(t) => (Number.isInteger(t) ? t : "")} style={axisStyle} />
          <VictoryBar
            data={daily.data.map((d) => ({ x: d.date.slice(5), y: d.views }))}
            style={{ data: { fill: "var(--primary)" } }}
          />
        </VictoryChart>
      )}
    </section>
  )
}

const stats = [
  {
    label: "Current rating",
    value: "1,428",
    change: "+34 this month",
  },
  {
    label: "Games played",
    value: "126",
    change: "8 this week",
  },
  {
    label: "Win rate",
    value: "64%",
    change: "+4.2% this month",
  },
  {
    label: "Best rating",
    value: "1,516",
    change: "Personal best",
  },
];

export default function StatsRow() {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/8 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-[#11110f] p-5">
          <p className="text-xs text-white/30">{stat.label}</p>

          <p className="mt-4 text-2xl font-medium tracking-tight">
            {stat.value}
          </p>

          <p className="mt-2 text-xs text-white/30">
            {stat.change}
          </p>
        </div>
      ))}
    </div>
  );
}

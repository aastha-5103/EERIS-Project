import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';


const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="toolTipChart">
          <p style={{ margin: 0 }}>{payload[0].name}</p>
          <p style={{ margin: 0 }}><b>${payload[0].value.toFixed(2)}</b></p>
        </div>
      );
    }
  
    return null;
  };



// Custom colors for the slices
const COLORS = ['#0FF0FC', '#a288d3', '#7aff90', '#ff8b7b', '#6b9dfc'];

function CustomPieChart({data}) {
  return (
    <PieChart width={500} height={400}>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={true}            // ✅ enables line to outside labels
        label={({ name }) => name}  // ✅ shows category name outside
        outerRadius={130}
        fill="#8884d8"
        dataKey="value"
        animationDuration={600}
        animationBegin={200}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      {/* 🛠 Add percentages inside pie separately */}
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={0}
        outerRadius={130}
        fill="#8884d8"
        dataKey="value"
        label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
        labelLine={false}
        isAnimationActive={false}
        animationDuration={600}
        animationBegin={200}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-inner-${index}`} fill="transparent" />
        ))}
      </Pie>

      <Tooltip content={<CustomTooltip />}/>
    </PieChart>
  );
}

export default CustomPieChart;

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';



function BudgetWheel({ percent }) {
  return (
    <div style={{ width: 120, height: 120 }}>
      <CircularProgressbar
        value={percent}
        text={`${percent}%`}
        styles={buildStyles({
          pathColor: "#0FF0FC",       // the filled color
          textColor: "#FFFFFF",          // text color inside
          trailColor: "#2A2A2A",         // background ring
          textSize: "1.3em",           // adjust text size
        })}
      />
    </div>
  );
}

export default BudgetWheel;

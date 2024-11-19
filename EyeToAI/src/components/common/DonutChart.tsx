// components/DonutChart.tsx
import React from 'react';
import Svg, {Path, G, Text, Circle} from 'react-native-svg';

interface DonutChartProps {
  data: {
    value: number;
    color: string;
    key: string;
  }[];
  size?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({data, size = 120}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const center = size / 2;
  const radius = (size * 0.8) / 2;
  const innerRadius = radius * 0.6;

  let currentAngle = 0;

  const createArc = (startAngle: number, endAngle: number): string => {
    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    return `
      M ${center} ${center}
      L ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${center} ${center}
    `;
  };

  return (
    <Svg height={size} width={size}>
      <G>
        {data.map((item, index) => {
          const angle = (item.value / total) * Math.PI * 2;
          const path = createArc(currentAngle, currentAngle + angle);
          currentAngle += angle;

          return <Path key={index} d={path} fill={item.color} />;
        })}
        {/* Inner circle for donut effect */}
        <Circle cx={center} cy={center} r={innerRadius} fill="white" />
      </G>
    </Svg>
  );
};

export default DonutChart;

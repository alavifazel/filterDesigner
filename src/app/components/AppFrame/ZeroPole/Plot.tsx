import React, { useEffect, useState } from 'react'
import { Line, Chart } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
ChartJS.register(...registerables);

export const Plot = ({ title, x_axis_label, y_axis_label, dataToPlot, plotColor }) => {
  const [data, setData] = useState(
    {
      labels: [],
      datasets: [
        {
          label: '',
          data: [],
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          fill: false,
        },
      ],
    }
  );

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: x_axis_label,
        },
      },
      y: {
        title: {
          display: true,
          text: y_axis_label,
        },
      },
    },
  }

  useEffect(() => {
    if (dataToPlot) {

      Object.keys(dataToPlot.xValues).forEach(key => {
        dataToPlot.xValues[key] = parseFloat(dataToPlot.xValues[key]).toFixed(2);
      })

    }
    setData({
      labels: dataToPlot.xValues,
      datasets: [
        {
          label: title,
          data: dataToPlot.yValues,
          borderColor: plotColor,
          borderWidth: 2,
          fill: false,
        },
      ],
    });

  }, [dataToPlot]);

  return (
    <div className="bg-gray-50 p-2 m-5 rounded-2xl shadow-md" style={{ height: '321px', width: 'calc(300px * 16 / 9)', position: 'relative' }}>
      <Line data={data} options={options} width={380} height={230} />
    </div>
  );
}

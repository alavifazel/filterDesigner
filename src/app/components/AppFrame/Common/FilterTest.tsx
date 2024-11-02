import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2';
import { ConfigurePopup } from './ConfigurePopup';

export const FilterTest = ({ polesAndZeroes, title, trigger, filterCoefficients, updateFilterEquation }) => {
  const [filteredOutput, setFilteredOutput] = useState([]);
  const [addNoiseChecked, setAddNoiseChecked] = useState(true);
  const [isConfigurePopupOpen, setIsConfigurePopupOpen] = useState(false);

  const [noiseMean, setNoiseMean] = useState<number>(1.0);
  const [noiseStandardDeviation, setNoiseStandardDeviation] = useState<number>(0.1);
  const [signalPeak, setSignalPeak] = useState<number>(1.0);

  const toggleConfigurePopup = () => {
    setIsConfigurePopupOpen(!isConfigurePopupOpen);
  };

  const [selectedTestSignals, setSelectedTestSignals] = useState({
    "sine": true,
    "delta": false,
    "square": false,
    "triangle": false,
    "noise": false
  });

  const plot = (value, filterCoefficients, addNoiseChecked) => {
    switch (value) {
      case "sine":
        plotOutput(addNoiseChecked ? addSignals(generateSineSignal(100), generateGaussianNoise(100)) : generateSineSignal(100), filterCoefficients);
        break;
      case "delta":
        plotOutput(addNoiseChecked ? addSignals(generateDeltaFunction(100), generateGaussianNoise(100)) : generateDeltaFunction(100), filterCoefficients);
        break;
      case "square":
        plotOutput(addNoiseChecked ? addSignals(generateSquareWaveSignal(100), generateGaussianNoise(100)) : generateSquareWaveSignal(100), filterCoefficients);
        break;
      case "triangle":
        plotOutput(addNoiseChecked ? addSignals(generateTriangleSignal(100), generateGaussianNoise(100)) : generateTriangleSignal(100), filterCoefficients);
    }
  }
  const handleAddNoise = () => {
    const value = Object.entries(selectedTestSignals).find(([key, value]) => value === true)[0];
    setAddNoiseChecked(!addNoiseChecked);
    plot(value, filterCoefficients, !addNoiseChecked);
  }

  const handleTestSignalSelect = (e) => {
    const value = e.target.value;

    setSelectedTestSignals((prev) => {
      let newState = { ...prev };
      for (const [key, _] of Object.entries(newState)) {
        newState[key] = false;
      }

      newState[value] = true;
      return newState;
    })
    plot(value, filterCoefficients, addNoiseChecked);
  };
  
  const options = {
    scales: {
      x: {
        title: {
          display: false,
          text: '',
        },
      },
      y: {
        title: {
          display: false,
          text: '',
        },
      },
    },
  }

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

  // Generate Gaussian noise via the Box-Muller method
  const generateGaussianNoise = (size) => {
    let mean = parseFloat(noiseMean.toString()); // I still don't know why this is needed.
    let standardDeviation = noiseStandardDeviation;
    let output = [];
    for (let i = 0; i < size; i++) {
      let u1 = Math.random();
      let u2 = Math.random();
      let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      output.push(  mean + z0 * standardDeviation);
    }
    return output;
  }

  /*
  A function to generate Sine signals
  */
  const generateSineSignal = (size) => {
    let output = [];
    let peak = signalPeak;
    for (let i = 0; i < size; i++) {
      output.push(peak * Math.sin(i * 0.1));
    }
    return output;
  }

  const generateSquareWaveSignal = (size, number_of_highs = 5) => {
    let output = [];
    let peak = signalPeak;
    for (let i = 0; i < number_of_highs; i++) {
      for (let j = 0; j < size / number_of_highs; j++) {
        if (i % 2 == 0) {
          output.push(peak);
        } else {
          output.push(0);
        }
      }
    }
    return output;
  }

  const generateTriangleSignal = (size) => {
    let output = [];
    let tmp = 0;
    let peak = signalPeak;
    const incrementValue = 0.1;
    let upwardIncrease = true;

    for (let i = 0; i < size; i++) {
      output.push(tmp);
    
      if (upwardIncrease) {
        tmp += incrementValue;
        if (tmp > peak) {
          tmp = peak;
          upwardIncrease = false;
        }
      } else {
        tmp -= incrementValue;
        if (tmp < 0) {
          tmp = 0;
          upwardIncrease = true;
        }
      }
    }
    return output;
  };

  const generateDeltaFunction = (size) => {
    let output = [];
    for (let i = 0; i < size; i++) {
      output.push(0);
    }
    output[output.length / 2] = signalPeak;
    return output;
  }

  const addSignals = (s1: any[], s2: any[]) => {
    console.assert(s1.length == s2.length);
    let output = [];
    for (let i = 0; i < s1.length; i++) {
      output.push(s1[i] + s2[i]);
    }
    return output;
  }

 
  const filter = (signal, filterCoefficients) => {
    console.log(filterCoefficients)
    const y_buffer = new Array(filterCoefficients.den.length).fill(0);
    let result = [];

    for (let i = 0; i < signal.length; i++) {
      let x_term_sums = 0;
      for (let j = 0; j < filterCoefficients.num.length; j++) {
        x_term_sums += filterCoefficients.num[j] * (i - j < 0 ? 0 : signal[i - j]);
      }

      let y_term_sums = 0;
      for (let j = 1; j < filterCoefficients.den.length; j++) {
        y_term_sums += filterCoefficients.den[j] * (i - j < 0 ? 0 : y_buffer[j - 1]);
      }
      const output = x_term_sums - y_term_sums;

      for (let j = y_buffer.length - 1; j > 0; j--) {
        y_buffer[j] = y_buffer[j - 1];
      }
      y_buffer[0] = output;

      result.push(output);
    }

    return result;
  };

  const plotOutput = (inputSignal, filterCoefficients) => {

    const filteredOutput = filter(inputSignal, filterCoefficients);
    setFilteredOutput(filteredOutput);
    let inputIndex = Array.from({ length: 100 }, (v, j) => j);

    setData({
      labels: inputIndex,
      datasets: [
        {
          label: "Generated signal",
          data: inputSignal,
          borderColor: 'rgba(255, 0, 0, 1)',
          borderWidth: 2,
          fill: false,
        },
        {
          label: "Filtered signal",
          data: filteredOutput,
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          fill: false,
        },
      ],
    });

  }

  useEffect(() => {
      const generatedSignal = addNoiseChecked ? addSignals(generateSineSignal(100), generateGaussianNoise(100)) : generateSineSignal(100);
      const value = Object.entries(selectedTestSignals).find(([key, value]) => value === true)[0];
      const filteredOutput = filter(generatedSignal, filterCoefficients);
      setFilteredOutput(filteredOutput);
      plot(value, filterCoefficients, addNoiseChecked);

  }, [trigger, noiseMean, noiseStandardDeviation, signalPeak]);


  return (
    <div className='bg-gray-50 p-2 m-5 rounded-2xl shadow-md' style={{ height: '475px', width: '515px'}}>

      <Line className="mx-2" data={data} options={options} height={200} />
      <div className="my-4">
        <div className="flex">
          <button value="sine" onClick={handleTestSignalSelect} className={`h-10 my-2 text-sm mx-2 px-5 ${selectedTestSignals["sine"] ? 'bg-slate-500 text-white' : 'bg-slate-200 text-black'}  rounded-lg hover:bg-gray-400`}>Sine</button>
          <button value="delta" onClick={handleTestSignalSelect} className={`h-10 my-2 text-sm mx-2 px-5 ${selectedTestSignals["delta"] ? 'bg-slate-500 text-white' : 'bg-slate-200'} rounded-lg hover:bg-gray-400`}>Delta</button>
          <button value="square" onClick={handleTestSignalSelect} className={`h-10 my-2 text-sm mx-2 px-5 ${selectedTestSignals["square"] ? 'bg-slate-500 text-white' : 'bg-slate-200 text-black'} rounded-lg hover:bg-gray-400`}>Square</button>
          <button value="triangle" onClick={handleTestSignalSelect} className={`h-10 my-2 text-sm mx-2 px-5 ${selectedTestSignals["triangle"] ? 'bg-slate-500 text-white' : 'bg-slate-200 text-black'} rounded-lg hover:bg-gray-400`}>Triangle</button>
          <button value="configure" onClick={toggleConfigurePopup} className={`h-10 my-2 text-sm mx-2 px-5 bg-black text-white rounded-lg hover:bg-gray-800`}>Configure</button>
          <ConfigurePopup 
            isOpen={isConfigurePopupOpen}
            onClose={toggleConfigurePopup}
            peak={signalPeak}
            noiseMean={noiseMean}
            noiseSd={noiseStandardDeviation}
            updatePeak={(e) => setSignalPeak((prev) => e )}
            updateMean={(e) => setNoiseMean((prev) => e )}
            updateSd={(e) => setNoiseStandardDeviation((prev) => e )}
          />
        </div>

        <div className="my-3">
          <label>
            <input
              className="mx-2 select-none"
              type="checkbox"
              checked={addNoiseChecked}
              onChange={handleAddNoise}
            />
            <span className="text-gray-900 dark:text-white">Add Gaussian Noise</span>

          </label>
        </div>
      </div>
    </div>

  );
}

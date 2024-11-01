import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2';
import { add, complex, multiply } from 'mathjs';
import { ConfigurePopup } from './ConfigurePopup';

export const FilterTest = ({ polesAndZeroes, title, magnitudeResponse, filterEquation, updateFilterEquation }) => {
  const [filteredOutput, setFilteredOutput] = useState([]);
  const [addNoiseChecked, setAddNoiseChecked] = useState(true);
  const [filterCoefficients, setFilterCoefficients] = useState<{ num: any[]; den: any[] }>({ num: [], den: [] });
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
        plotOutput(addNoiseChecked ? addSignals(generateSawToothSignal(100), generateGaussianNoise(100)) : generateSawToothSignal(100), filterCoefficients);
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

  const convolve = (a, b) => {
    let m = a.length + b.length - 1;
    let result = new Array(m).fill(0);
    for (let i = 0; i < a.length; i++) {
      let sum = 0;
      for (let j = 0; j < b.length; j++) {
        result[i + j] = add(result[i + j], multiply(a[i], b[j]));
      }
    }

    return result;
  }

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

  const getNormalizedCoordinate = (point) => {
    return { x: (point.x - 200) / 200, y: (point.y - 200) / 200 };
  }

  /*
    Converts the 2D pixel coordinates of the poles and zeros that the user 
    places on the Z-plane to their actual complex number values on the Z-plane.
  */
  const getTheActualPolesAndZeroesNumbersNotTheDotsOnConvas = (x) => {
    let tmp = x.map(pz => ({ ...pz, point: getNormalizedCoordinate(pz.point) }));
    return tmp;
  }

  const constructTransferFunctionNumAndDenPolynomials = (x) => {
    let num = [];
    let den = [];
    for (let i = 0; i < x.length; i++) {
      if (x[i].poleSelected)
        den.push([1, complex(-x[i].point.x, -x[i].point.y)]);
      else
        num.push([1, complex(-x[i].point.x, -x[i].point.y)]);
    }
    return { num: num, den: den };
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

  const generateSawToothSignal = (size) => {
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

  /*
  The following function receives the poles and zeroes of a transfer function
  and returns the IIR filter coefficients associated with the poles and zeroes. 
  How is this achieved? A transfer function defined by its poles and zeroes has the form:
 
    ((z - m1)(z - m2)(z - m3)...)/((z - p1)(z - p2)...)
  
  where m1, m2, ... are zeroes and p1, p2, p3, ... are poles. To a transfer function expressed 
  in this form to the 'difference equation' form, we have to multiply the terms in the numerator and denominator 
  to reach a following that would look like:
  
    (2z^(-n) + 2z^(-n-1) + ...)/(1 + z^(-1))
  
  The following function does exactly that which multiplies the polynomials using the convolution operation.
  An idea to speed up this function: Use FFT to compute the convolution! 
  */
  const calculateFilterCoefficients = (polynomials) => {
    let num = [];
    let den = [];

    let tmp = polynomials.num[0];
    for (let i = 1; i < polynomials.num.length; i++) {
      tmp = convolve(tmp, polynomials.num[i]);
    }
    num = tmp;

    tmp = polynomials.den[0];
    for (let i = 1; i < polynomials.den.length; i++) {
      tmp = convolve(tmp, polynomials.den[i]);
    }
    den = tmp;

    if (!num) num = [1];
    if (!den) den = [0];
    return { num: num, den: den }
  }

  const filter = (signal, filterCoefficients) => {
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

  const constructFilterEquationString = (filterCoefficients) => {
    let output = "y[n] = ";
    for (let i = 0; i < filterCoefficients.num.length; i++) {
      if (filterCoefficients.num[i] == 1)
        output += "x[n]";
      else output += String(Math.abs(Number(filterCoefficients.num[i])).toFixed(2)) + "x[n" + (i != 0 ? "-" + String(i) + "]" : "]");
      if (i < filterCoefficients.num.length - 1 && filterCoefficients.num.length > 1)
        if (filterCoefficients.num[i + 1] > 0)
          output += " + ";
        else
          output += " - ";
    }
    if (filterCoefficients.num.length > 0 && (filterCoefficients.den.length > 0 && filterCoefficients.den[1])) {
      output += " + ";
    }

    for (let i = 0; i < filterCoefficients.den.length; i++) {
      if (filterCoefficients.den[i] == 1)
        output += "y[n]";

      else if (filterCoefficients.den[i] != 0) {
        output += String(Math.abs(Number(filterCoefficients.den[i])).toFixed(2)) + "y[n" + (i != 0 ? "-" + String(i) + "]" : "]")
      }
      if (i != filterCoefficients.den.length - 1)
        if (filterCoefficients.den[i + 1] > 0)
          output += " + ";
        else
          output += " - ";
    }
    return output;
  }

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
      let tmp = getTheActualPolesAndZeroesNumbersNotTheDotsOnConvas(polesAndZeroes);
      let filterCoefficients = calculateFilterCoefficients(constructTransferFunctionNumAndDenPolynomials(tmp));
      setFilterCoefficients(filterCoefficients);
      updateFilterEquation(constructFilterEquationString(filterCoefficients));
      const generatedSignal = addNoiseChecked ? addSignals(generateSineSignal(100), generateGaussianNoise(100)) : generateSineSignal(100);
      const value = Object.entries(selectedTestSignals).find(([key, value]) => value === true)[0];
      const filteredOutput = filter(generatedSignal, filterCoefficients);
      setFilteredOutput(filteredOutput);
      plot(value, filterCoefficients, addNoiseChecked);

  }, [magnitudeResponse, noiseMean, noiseStandardDeviation, signalPeak]);


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

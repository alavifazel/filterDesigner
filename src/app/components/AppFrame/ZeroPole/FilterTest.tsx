import React, { useEffect, useState } from 'react'
import { Line } from 'react-chartjs-2';
import { add, complex, multiply } from 'mathjs';


export const FilterTest = ({ polesAndZeroes, title, magnitudeResponse, filterEquation, updateFilterEquation }) => {
  const [filteredOutput, setFilteredOutput] = useState([]);

  // Function to compute convolution of integer arrays:
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
  const generateGaussianNoise = (mean = 0, standardDeviation = 1) => {
    let u1 = Math.random();
    let u2 = Math.random();
    let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 *standardDeviation;
  }

  /*
  A function to generate a Sine signal with added Gaussian noise
  TODO: Allow the user to generate other types of signals
  */
  const generateSignal = (input) => {
    let output = [];
    const sinAmplitude = Math.random() * 20 + 2;
    for (let i = 0; i < input.length; i++) {
      output.push(sinAmplitude * Math.sin(i * 0.1) + generateGaussianNoise());
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
      if( filterCoefficients.num[i] == 1 ) 
        output += "x[n]";
      else output += String(Math.abs(Number(filterCoefficients.num[i])).toFixed(2)) + "x[n" + (i != 0 ? "-" + String(i) + "]" : "]");
      if (i < filterCoefficients.num.length - 1 && filterCoefficients.num.length > 1)
        if (filterCoefficients.num[i + 1] > 0)
          output += " + ";
        else
          output += " - ";
    }
    if (filterCoefficients.num.length > 0 && (filterCoefficients.den.length > 0 && filterCoefficients.den[1]))
    {
      output += " + ";
    }
 
    for (let i = 0; i < filterCoefficients.den.length; i++) {
      if(filterCoefficients.den[i] == 1 ) 
        output += "y[n]";

      else if (filterCoefficients.den[i] != 0) 
      {
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

  useEffect(() => {

    let inputData = Array.from({ length: 100 }, (v, j) => j);

    if (magnitudeResponse) {
      const generatedSignal = generateSignal(inputData);
      let tmp = getTheActualPolesAndZeroesNumbersNotTheDotsOnConvas(polesAndZeroes);

      let filterCoefficients = calculateFilterCoefficients(constructTransferFunctionNumAndDenPolynomials(tmp));
      updateFilterEquation(constructFilterEquationString(filterCoefficients));
      const filteredOutput = filter(generatedSignal, filterCoefficients);

      setFilteredOutput(filteredOutput);
      Object.keys(magnitudeResponse.xValues).forEach(key => {
        magnitudeResponse.xValues[key] = parseFloat(magnitudeResponse.xValues[key]).toFixed(2);
      })

      setData({
        labels: inputData,
        datasets: [
          {
            label: "Generated signal",
            data: generatedSignal,
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

  }, [magnitudeResponse]);


  return (
    <div className="bg-gray-50 p-2 m-5 rounded-2xl shadow-md" style={{ height: '480px', width: '520px', position: 'relative' }}>
      <Line data={data} options={options} width={480} height={480} />
    </div>
  );
}

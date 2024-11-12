import { add, multiply } from 'mathjs';

export const convolve = (a, b) => {
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

export const filter = (signal, filterCoefficients) => {
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


export const ZeroPad = (array, sizeOfTheZeroPaddedArray) => {
    console.assert(array.length < sizeOfTheZeroPaddedArray);
    let theRestOfTheZeroPaddedArray = new Array(sizeOfTheZeroPaddedArray - array.length).fill(0);
    return array.concat(theRestOfTheZeroPaddedArray);
}

export const getImpulseResponse = (filterCoefficients, size=1000) => {
    let impulseSignal = [];
    impulseSignal.push(1);
    for (let i = 0; i < size; i++) {
        impulseSignal.push(0);
    }
    return filter(impulseSignal, filterCoefficients);
}

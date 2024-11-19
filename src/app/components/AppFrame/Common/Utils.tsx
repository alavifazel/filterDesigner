import { add, complex, multiply } from 'mathjs';
import { filterType } from './enums';

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

export const getImpulseResponse = (filterCoefficients, size = 1000) => {
    let impulseSignal = [];
    impulseSignal.push(1);
    for (let i = 0; i < size; i++) {
        impulseSignal.push(0);
    }
    return filter(impulseSignal, filterCoefficients);
}

export const aValueTimesElementsOfArray = (K, arr) => {
    let res = [];
    for (let i = 0; i < arr.length; i++) {
        res.push(arr[i] * K);
    }
    return res;
}

export const construct_Z_plus_one_or_Z_minus_one_polynomial = (N, diff) => {
    let polynomialCoeffs = [];
    for (let i = 0; i < N - diff; i++)
        polynomialCoeffs.push([1, 1]);

    for (let i = 0; i < diff; i++)
        polynomialCoeffs.push([1, -1]);

    let res = polynomialCoeffs[0];
    for (let i = 1; i < polynomialCoeffs.length; i++) {
        res = convolve(res, polynomialCoeffs[i]);
    }
    return res;
}
export const addArraysFromRight = (arr1, arr2) => {

    let maxLength = arr1.length > arr2.length ? arr1.length : arr2.length;
    let res = Array(maxLength).fill(0);
    let arr1LastIndex = arr1.length - 1;
    let arr2LastIndex = arr2.length - 1;

    for (let i = maxLength - 1; i >= 0; i--) {
        if (arr1LastIndex >= 0) res[i] += arr1[arr1LastIndex--];
        if (arr2LastIndex >= 0) res[i] += arr2[arr2LastIndex--];
    }

    return res;
};


export const bilinearTransform = (coeff: { num: any[]; den: any[] }) => { // Receives transfer function coefficients as an array
    // Necessary to reverse them to make it suitable to apply the next procedures
    coeff.num = coeff.num.reverse();
    coeff.den = coeff.den.reverse();

    const N = Math.max(coeff.num.length, coeff.den.length) - 1;
    const K = 2;
    let tmp = [];
    for (let i = 0; i < coeff.num.length; i++) {
        tmp.push(aValueTimesElementsOfArray(coeff.num[i] * Math.pow(K, i), construct_Z_plus_one_or_Z_minus_one_polynomial(N, i)));
    }

    let resNum = tmp[0];
    for (let i = 1; i < tmp.length; i++)
        resNum = addArraysFromRight(resNum, tmp[i])

    tmp = [];
    for (let i = 0; i < coeff.den.length; i++) {
        tmp.push(aValueTimesElementsOfArray(coeff.den[i] * Math.pow(K, i), construct_Z_plus_one_or_Z_minus_one_polynomial(N, i)));
    }

    let resDen = tmp[0];
    for (let i = 1; i < tmp.length; i++)
        resDen = addArraysFromRight(resDen, tmp[i])

    // Normalize
    let firstCoefBeforeBeingChanged = resDen[0];
    for (let i = 0; i < resDen.length; i++)
        resDen[i] = resDen[i] / firstCoefBeforeBeingChanged;

    for (let i = 0; i < resNum.length; i++)
        resNum[i] = resNum[i] / firstCoefBeforeBeingChanged;

    return { num: resNum, den: resDen };
}

export const transformAnalogLowpassToHighpass = (arr, numberOfPoles, Omega_c, target_freq) => {
    for (let i = 0; i < arr.length - 1; i++)
        arr.den[i] *= Math.pow(Omega_c * target_freq, arr.length - i - 1);
    return {
        num: Array(arr.den.length).fill(0).map((_, index) => index == 0 ? Math.pow(Omega_c, numberOfPoles) : 0)
        , den: arr.den.reverse()
    }
}

export const getCausalButterworthPoles = (N, Omega_c) => { // N = Filter Order
    let s_k = [];
    for (let k = 0; k < 2 * N; k++) {
        let tmp = (Math.PI) / (2 * N) * (N + 2 * k - 1);
        s_k.push(complex(Omega_c * Math.cos(tmp), Omega_c * Math.sin(tmp)));
    }
    return s_k.filter(e => e.re < 0);
}

export const H_of_s = (poles, Omega_c, type) => {
    let convRes = [];
    let tmp = [];
    for (let i = 0; i < poles.length; i++) {
        tmp.push([1, complex(-poles[i].re, -poles[i].im)]);
    }

    let tmp2 = tmp[0];
    for (let i = 1; i < tmp.length; i++) {
        tmp2 = convolve(tmp2, tmp[i]);
    }
    convRes = tmp2;
    let res = [1];
    for (let i = 1; i < convRes.length; i++) {
        res.push(convRes[i].re);
    }

    const tf = { num: [Math.pow(Omega_c, poles.length)], den: res };
    switch (type) {
        case filterType.LOWPASS:
            return tf;
        case filterType.HIGHPASS:
            return transformAnalogLowpassToHighpass(tf, poles.length, Omega_c, Omega_c);
    }
}

export const countNumberOfOccurrences = (str, c) => {
    return str.split(c).length-1;
}
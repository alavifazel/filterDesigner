export const Hamming = (M) => {
    let array = new Array(M);
    for (let i = 0; i < M; i++) {
        array[i] = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (M - 1))
    }
    return array;
}

export const Bartlett = (M) => {
    let array = new Array(M);
    for (let i = 0; i < M; i++) {
        array[i] = 1 - (2*Math.abs(i - (M-1)/2))/(M-1);
    }
    return array;

}

export const Han = (M) => {
    let array = new Array(M);
    for (let i = 0; i < M; i++) {
        array[i] = 0.5 * (1 - Math.cos((2*Math.PI*i)/(M-1)));
    }
    return array;
}

// TODO
// export const Kaiser = (M, a) => {
//     let array = new Array(M);
//     for (let i = 0; i < M; i++) {
//     }
//     return array;
// }
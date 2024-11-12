# FilterDesigner
A web app for designing and visualizing [digital filters](https://en.wikipedia.org/wiki/Digital_filter).
In the current version, a filter can be designed via:
- Visually placing poles and zeros on a Z-plane.
- FIR design using Windowing method.
- IIR design using Butterworth method.

Afterwards, the web app:
- Computes the the magnitude and phase of the filter’s frequency response
- Generates the filter coefficients
- Visualizes the filter's output on a various input signals

## Getting Started
To use the app, simply visit [https://alavifazel.github.io/filterDesigner](https://alavifazel.github.io/filterDesigner).
Alternatively, to install and run the app locally, make sure you have a recent version of [Node](https://nodejs.org/en) installed.
Afterwards:

- Clone the repository:
```shell
git clone https://github.com/alavifazel/filterDesigner
cd filterDesigner
```
- Install the dependencies:
```shell
npm install
```
- Run the web app:
```shell
npm run dev
```
- The app should become accessible on 'http://localhost:3000' or on a similar port.

<!-- ## Demo
The following video shows the design of a low-pass filter:
![](https://raw.githubusercontent.com/alavifazel/demo/refs/heads/main/animation-smaller.gif) -->

## License
The software is released under Apache License 2.0. View the LICENSE file for more info.

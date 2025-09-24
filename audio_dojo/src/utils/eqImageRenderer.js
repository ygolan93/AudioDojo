export async function renderEQCurveToImage(shape, frequency, gain, q = 1.0) {
return new Promise((resolve) => {
const width = 400;
const height = 200;
const canvas = document.createElement("canvas");
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext("2d");


// background
ctx.fillStyle = "#1e1e1e";
ctx.fillRect(0, 0, width, height);


// axes
ctx.strokeStyle = "#444";
ctx.beginPath();
ctx.moveTo(40, height / 2);
ctx.lineTo(width - 10, height / 2);
ctx.stroke();


// label
ctx.fillStyle = "#a3e635";
ctx.font = "12px sans-serif";
ctx.fillText(`Shape: ${shape} | Freq: ${frequency}Hz | Gain: ${gain}dB`, 40, 20);


// simple EQ curve shape
ctx.strokeStyle = "#a3e635";
ctx.beginPath();
for (let x = 0; x < width; x++) {
const freq = 20 * Math.pow(10, (x / width) * 3); // log scale
const distance = Math.log10(freq / frequency);
const response = gain * Math.exp(-q * distance ** 2);
const y = height / 2 - response * 5;
ctx.lineTo(x, y);
}
ctx.stroke();


resolve(canvas.toDataURL("image/png"));
});
}
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const pixelSize = 8;
const screenWidth = canvas.width / pixelSize;
const screenHeight = canvas.height / pixelSize;
let stepSize = 200;

// prettier-ignore
document.getElementById("stepsize").addEventListener("input", (e) => { stepSize = parseInt(e.target.value); });

const mouse = {
  x: 0,
  y: 0,
  press: false,
};

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);

function startDrawing(e) {
  mouse.press = true;
  draw(e);
}

function draw(e) {
  if (mouse.press) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = Math.floor((e.clientX - rect.left) / pixelSize);
    mouse.y = Math.floor((e.clientY - rect.top) / pixelSize);
  }
}

function stopDrawing() {
  mouse.press = false;
}

let imageCanvas = document.createElement("canvas");
let imageContext = imageCanvas.getContext("2d", { willReadFrequently: true });
let image = new Image();
image.src = "image.jpg";
image.onload = () => {
  imageCanvas.width = screenWidth;
  imageCanvas.height = screenHeight;
  imageContext.drawImage(image, 0, 0, imageCanvas.width, imageCanvas.height);
};

document.getElementById("imageUpload").addEventListener("change", (e) => {
  let reader = new FileReader();
  reader.onload = function (e) {
    let image = new Image();
    image.src = e.target.result;
    image.onload = function () {
      imageContext.drawImage(image, 0, 0, imageCanvas.width, imageCanvas.height);
    };
  };
  reader.readAsDataURL(e.target.files[0]);
});

function sampleImage(x, y) {
  let [r, g, b] = imageContext.getImageData(x, y, 1, 1).data;
  return `rgb(${r + 1}, ${g}, ${b})`;
}

const pixelArray = new Array(screenHeight * screenWidth).fill("rgb(0, 0, 0)");
let clonedArray = new Array(screenHeight * screenWidth).fill("rgb(0, 0, 0)");

function simulate(py, px) {
  clonedArray = [...pixelArray];

  for (let i = 0; i < stepSize; i++) {
    for (let y = clonedArray.length / screenWidth - 2; y > 0; y--) {
      const index = y * screenWidth;
      for (let x = 2; x < screenWidth - 2; x++) {
        const currentIndex = index + x;

        if (clonedArray[currentIndex] !== "rgb(0, 0, 0)") {
          if (clonedArray[currentIndex + screenWidth] === "rgb(0, 0, 0)")
            clonedArray[currentIndex + screenWidth] = clonedArray[currentIndex];
          else if (clonedArray[currentIndex + screenWidth + 1] === "rgb(0, 0, 0)")
            clonedArray[currentIndex + screenWidth + 1] = clonedArray[currentIndex];
          else if (clonedArray[currentIndex + screenWidth - 1] === "rgb(0, 0, 0)")
            clonedArray[currentIndex + screenWidth - 1] = clonedArray[currentIndex];
          else continue;

          clonedArray[currentIndex] = "rgb(0, 0, 0)";
        }
      }
    }
  }

  for (let i = 0; i < 255; i++) {
    if (py > canvas.height / pixelSize - 2 || px < 1 || px > screenWidth - 2) break;

    const index = py * screenWidth + px;
    if (clonedArray[index + screenWidth] === "rgb(0, 0, 0)") py += 1;
    else if (clonedArray[index + screenWidth + 1] === "rgb(0, 0, 0)") px += 1;
    else if (clonedArray[index + screenWidth - 1] === "rgb(0, 0, 0)") px -= 1;
    else break;
  }

  return sampleImage(px, py);
}

function frame() {
  if (mouse.press) {
    const index = mouse.y * screenWidth + mouse.x;
    const color = simulate(mouse.y, mouse.x);
    pixelArray[index] = color;
  }

  for (let y = screenHeight - 2; y > 0; y--) {
    const index = y * screenWidth;
    for (let x = 1; x < screenWidth - 1; x++) {
      const currentIndex = index + x;

      if (pixelArray[currentIndex] !== "rgb(0, 0, 0)") {
        if (pixelArray[currentIndex + screenWidth] === "rgb(0, 0, 0)")
          pixelArray[currentIndex + screenWidth] = pixelArray[currentIndex];
        else if (pixelArray[currentIndex + screenWidth + 1] === "rgb(0, 0, 0)")
          pixelArray[currentIndex + screenWidth + 1] = pixelArray[currentIndex];
        else if (pixelArray[currentIndex + screenWidth - 1] === "rgb(0, 0, 0)")
          pixelArray[currentIndex + screenWidth - 1] = pixelArray[currentIndex];
        else continue;

        pixelArray[currentIndex] = "rgb(0, 0, 0)";
      }
    }
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < screenHeight; y++) {
    const index = (y * canvas.width) / pixelSize;
    for (let x = 1; x < screenWidth - 1; x++) {
      ctx.fillStyle = pixelArray[index + x];
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

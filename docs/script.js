const videoElement = document.getElementById('video');
const resultBox = document.getElementById('result');
const stopButton = document.getElementById('stop');

const codeReader = new ZXing.BrowserMultiFormatReader();

let currentStream = null;

// Start decoding
codeReader.decodeFromVideoDevice(null, videoElement, (result, err, controls) => {
  if (result) {
    // We got a barcode
    const barcode = result.getText();
    resultBox.textContent = `✅ Найден штрихкод: ${barcode}`;

    // Send barcode back to Telegram
    if (window.Telegram && Telegram.WebApp) {
      Telegram.WebApp.sendData(barcode);
    }

    // Stop camera
    controls.stop();
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }
  } else if (err && !(err instanceof ZXing.NotFoundException)) {
    console.error(err);
    resultBox.textContent = `Ошибка: ${err}`;
  }
});

// Stop button
stopButton.addEventListener('click', () => {
  codeReader.reset();
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }
  resultBox.textContent = "Сканирование остановлено.";
});

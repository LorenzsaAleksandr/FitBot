const video = document.getElementById("video");
const resultBox = document.getElementById("result");
const stopBtn = document.getElementById("stop-btn");

const codeReader = new ZXing.BrowserMultiFormatReader();
let currentStream = null;

// Запрашиваем доступ к камере и выводим на видеоэлемент
async function requestCamera() {
  try {
    const constraints = {
      video: {
        facingMode: { ideal: "environment" } // основная камера
      },
      audio: false
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    await video.play();

    currentStream = stream;
    return stream;
  } catch (err) {
    console.error("Ошибка доступа к камере:", err);
    resultBox.textContent = "❌ Ошибка доступа к камере: " + err.message;
    throw err;
  }
}

// Запускаем сканер
async function startScanner() {
  try {
    await requestCamera();

    const devices = await codeReader.listVideoInputDevices();
    const backCam = devices.find(d => d.label.toLowerCase().includes("back")) || devices[0];

    await codeReader.decodeFromVideoDevice(backCam.deviceId, video, (result, err) => {
      if (result) {
        const barcode = result.getText();
        resultBox.textContent = "✅ Штрихкод: " + barcode;
        codeReader.reset();
        stopCamera();

        // Отправка в Telegram WebApp
        if (window.Telegram && Telegram.WebApp) {
          Telegram.WebApp.sendData(barcode);
        }
      }
    });

    resultBox.textContent = "🔎 Сканирование запущено...";
  } catch (err) {
    console.error("Ошибка запуска сканера:", err);
    resultBox.textContent = "❌ Ошибка запуска сканера: " + err.message;
  }
}

// Останавливаем камеру
function stopCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }
  codeReader.reset();
  resultBox.textContent = "⛔ Сканер остановлен";
}

// Кнопка стоп
stopBtn.addEventListener("click", () => {
  stopCamera();
});

// Запуск при загрузке
window.addEventListener("DOMContentLoaded", () => {
  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.expand();
  }
  startScanner();
});

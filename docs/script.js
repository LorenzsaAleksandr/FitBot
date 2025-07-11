const video = document.getElementById("video");
const resultBox = document.getElementById("result");
const stopBtn = document.getElementById("stop-btn");

const codeReader = new ZXing.BrowserMultiFormatReader();
let controls = null;

async function startScanner() {
  try {
    const devices = await codeReader.listVideoInputDevices();
    const backCam = devices.find(d => d.label.toLowerCase().includes("back")) || devices[0];

    controls = await codeReader.decodeFromVideoDevice(backCam.deviceId, video, (result, err) => {
      if (result) {
        const barcode = result.getText();
        resultBox.textContent = "✅ Штрихкод: " + barcode;

        // Отправка в Telegram
        if (window.Telegram && Telegram.WebApp) {
          Telegram.WebApp.sendData(barcode);
        }

        // Остановить сканирование
        stopCamera();
      } else if (err && !(err instanceof ZXing.NotFoundException)) {
        console.error(err);
        resultBox.textContent = "❌ Ошибка сканирования: " + err.message;
      }
    });

    resultBox.textContent = "🔎 Сканирование запущено...";
  } catch (err) {
    console.error("Ошибка запуска сканера:", err);
    resultBox.textContent = "❌ Не удалось запустить камеру: " + err.message;
  }
}

function stopCamera() {
  if (controls) {
    controls.stop();
    controls = null;
  }
  codeReader.reset();
  resultBox.textContent = "⛔ Сканер остановлен";
}

stopBtn.addEventListener("click", stopCamera);

window.addEventListener("DOMContentLoaded", () => {
  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.expand();
  }
  startScanner();
});

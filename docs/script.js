const video = document.getElementById("video");
const resultBox = document.getElementById("result");
const stopBtn = document.getElementById("stop-btn");

const codeReader = new ZXing.BrowserMultiFormatReader();
let currentDeviceId = null;

// Просим доступ к камере отдельно
async function requestCameraPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    stream.getTracks().forEach(track => track.stop()); // сразу останавливаем, просто чтобы триггерить запрос
    console.log("Доступ к камере получен");
  } catch (e) {
    console.error("Ошибка доступа к камере:", e);
    resultBox.textContent = "Ошибка доступа к камере: " + e.message;
  }
}

// Запуск сканера
async function initScanner() {
  try {
    const devices = await codeReader.listVideoInputDevices();
    if (!devices.length) throw new Error("Нет доступных камер");

    currentDeviceId = devices[0].deviceId;

    await codeReader.decodeFromVideoDevice(currentDeviceId, video, (result, err) => {
      if (result) {
        const barcode = result.text;
        resultBox.textContent = "Штрихкод: " + barcode;
        codeReader.reset();

        if (window.Telegram && Telegram.WebApp) {
          Telegram.WebApp.sendData(barcode);
        }
      }

      if (err && !(err instanceof ZXing.NotFoundException)) {
        console.error("Ошибка при сканировании:", err);
      }
    });

    resultBox.textContent = "Наведи камеру на штрихкод...";
  } catch (error) {
    resultBox.textContent = "Ошибка: " + error.message;
  }
}

// Остановка сканера
stopBtn.addEventListener("click", () => {
  codeReader.reset();
  const tracks = video.srcObject?.getTracks() || [];
  tracks.forEach(track => track.stop());
  resultBox.textContent = "Сканер остановлен";
});

// Telegram init и запуск камеры
window.addEventListener("DOMContentLoaded", async () => {
  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.expand();
  }

  await requestCameraPermission();
  initScanner();
});

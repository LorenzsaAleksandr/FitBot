const video = document.getElementById('video');
const resultBox = document.getElementById('result');

// Telegram WebApp ready
if (window.Telegram && Telegram.WebApp) {
  Telegram.WebApp.ready();
}

const codeReader = new ZXing.BrowserMultiFormatReader();

codeReader.decodeFromVideoDevice(null, video, async (result, err) => {
  if (result) {
    const barcode = result.text;
    resultBox.textContent = `Штрих-код: ${barcode}`;

    const foodData = await fetchFoodInfo(barcode);
    if (foodData) {
      const { name, calories, proteins, fats, carbs } = foodData;
      resultBox.innerHTML = `
        ✅ <b>${name}</b><br>
        Калории: ${calories}<br>
        Белки: ${proteins} г<br>
        Жиры: ${fats} г<br>
        Углеводы: ${carbs} г
      `;
      if (window.Telegram && Telegram.WebApp) {
        Telegram.WebApp.sendData(JSON.stringify({ barcode, name, calories, proteins, fats, carbs }));
      }
    } else {
      resultBox.textContent = '❌ Не удалось найти информацию';
    }
  }
});

async function fetchFoodInfo(barcode) {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await res.json();
    if (!data.product) return null;
    const p = data.product;
    return {
      name: p.product_name || "Без названия",
      calories: p.nutriments['energy-kcal'] || 0,
      proteins: p.nutriments.proteins || 0,
      fats: p.nutriments.fat || 0,
      carbs: p.nutriments.carbohydrates || 0,
    };
  } catch {
    return null;
  }
}

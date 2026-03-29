let chart;

function log(msg, data = null) {
  console.log(`[LOG] ${msg}`, data || "");
}

function saveData() {
  log("saveData called");

  const datetime = document.getElementById("datetime").value;
  const weight = parseFloat(document.getElementById("weight").value);

  log("入力値", { datetime, weight });

  if (!datetime || !weight || weight <= 0) {
    alert("正しい日時と体重を入力してください");
    log("バリデーションNG");
    return;
  }

  let data = JSON.parse(localStorage.getItem("weights")) || [];
  log("保存前データ", data);

  data.push({ datetime, weight });

  data.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  localStorage.setItem("weights", JSON.stringify(data));

  log("保存後データ", data);

  renderList();
  renderChart();
}

function renderList() {
  log("renderList called");

  const list = document.getElementById("list");
  list.innerHTML = "";

  let data = JSON.parse(localStorage.getItem("weights")) || [];
  log("リストデータ", data);

  // ★ここで1回だけフィルター
  data = data.filter(item => item.datetime && item.weight);

  data.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  data.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = `${item.datetime.replace("T", " ")} : ${item.weight}kg `;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "削除";
    deleteBtn.onclick = () => deleteData(index);

    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}


function renderChart() {
  log("renderChart called");

  let data = JSON.parse(localStorage.getItem("weights")) || [];
  data = data.filter(item => item.datetime && item.weight);

  data.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  log("チャート用データ", data);

  if (data.length === 0) {
    log("データなし → グラフ描画スキップ");
    return;
  }

  data.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

  const labels = data.map(item => item.datetime.replace("T", " "));
  const weights = data
    .map(item => Number(item.weight))
    .filter(w => !isNaN(w) && w > 0);

  // ★安全に最大値取得
  const maxWeight = weights.length > 0 ? Math.max(...weights) : 100;
  const yMax = Math.ceil(maxWeight + 5);

  
  log("labels", labels);
  log("weights", weights);

  const canvas = document.getElementById("chart");
  if (!canvas) {
    log("canvasが見つからない");
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    log("ctx取得失敗");
    return;
  }

  if (chart) {
    log("既存chart破棄");
    chart.destroy();
  }

  try {
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          label: "体重(kg)",
          data: weights,
          borderColor: "blue",
          fill: false,
          tension: 0.2
        }]
      },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: { display: true, text: '日時' }
            },
            y: {
              min: 0,
              max: yMax || 100, // fallback
              title: { display: true, text: '体重(kg)' }
            }
        }
    }
    });

    log("グラフ生成成功");
  } catch (e) {
    console.error("グラフ生成エラー", e);
  }
}

function deleteData(index) {
  log("deleteData", index);

  let data = JSON.parse(localStorage.getItem("weights")) || [];
  data.splice(index, 1);
  localStorage.setItem("weights", JSON.stringify(data));

  renderList();
  renderChart();
}

function setNow() {
  log("setNow called");

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');

  document.getElementById("datetime").value =
    `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

document.addEventListener("DOMContentLoaded", () => {
  log("DOM読み込み完了");

  setNow();
  renderList();
  renderChart();
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("Service Worker 登録成功"))
    .catch(err => console.error("Service Worker 登録失敗", err));
}

document.addEventListener("DOMContentLoaded", () => {
  const templatesContainer = document.getElementById("templates-container");
  const titleInput = document.getElementById("title-input");
  const txtInput = document.getElementById("txt-input");
  const addTemplateButton = document.getElementById("add-template");
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const deleteTemplateButton = document.getElementById("delete-template");

  function loadTemplates() {
    fetch("/get_templates")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          templatesContainer.innerHTML = data.templates
            .map(
              (template) => `
              <div class="template-item" data-id="${template.id}" data-txt="${template.txt}">
                <h3>${template.title}</h3>
                <p>${template.txt}</p>
                <button class="delete-template-button" style="display: none; font-size: 20pt;">削除</button>
              </div>
              `
            )
            .join("");

          const templateItems = document.querySelectorAll(".template-item");
          templateItems.forEach((item) => {
            const deleteButton = item.querySelector(".delete-template-button");
            deleteButton.addEventListener("click", () => {
              const templateId = item.dataset.id;
              deleteTemplate(templateId, item);
            });
          });
        }
      })
      .catch((error) => console.error("Error:", error));
  }

  function deleteTemplate(templateId, element) {
    fetch(`/delete_template/${templateId}`, { method: "DELETE" })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          element.remove();
        } else {
          alert(data.message);
        }
      })
      .catch((error) => console.error("Error:", error));
  }

  deleteTemplateButton.addEventListener("click", () => {
    const deleteButtons = document.querySelectorAll(".delete-template-button");
    deleteButtons.forEach((button) => {
      button.style.display = "block";
    });

    const templateItems = document.querySelectorAll(".template-item");
    templateItems.forEach((item) => {
      item.removeEventListener("click", () => {
        const textToCopy = item.dataset.txt;
        copyToClipboard(textToCopy, item);
      });
    });
  });

  addTemplateButton.addEventListener("click", () => {
    const title = titleInput.value.trim();
    const txt = txtInput.value.trim();

    if (title && txt) {
      fetch("/add_template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, txt }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            loadTemplates();
            titleInput.value = "";
            txtInput.value = "";
          } else {
            alert(data.message);
          }
        })
        .catch((error) => console.error("Error:", error));
    } else {
      alert("Both title and text are required.");
    }
  });

  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();

    if (query) {
      fetch(`/search_templates?query=${encodeURIComponent(query)}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            templatesContainer.innerHTML = data.templates
              .map(
                (template) => `
                <div class="template-item" data-id="${template.id}" data-txt="${template.txt}">
                  <h3>${template.title}</h3>
                  <p>${template.txt}</p>
                  <button class="delete-template-button" style="display: none; font-size: 20pt;">削除</button>
                </div>
                `
              )
              .join("");

            const templateItems = document.querySelectorAll(".template-item");
            templateItems.forEach((item) => {
              const deleteButton = item.querySelector(".delete-template-button");
              deleteButton.addEventListener("click", () => {
                const templateId = item.dataset.id;
                deleteTemplate(templateId, item);
              });

              item.addEventListener("click", () => {
                const textToCopy = item.dataset.txt;
                copyToClipboard(textToCopy, item);
              });
            });
          } else {
            templatesContainer.innerHTML = "<p>No matching templates found.</p>";
          }
        })
        .catch((error) => console.error("Error:", error));
    } else {
      alert("Please enter a search query.");
    }
  });

  loadTemplates();
});

document.getElementById("template_toggleButton").addEventListener("click", function () {
  const templateContainer = document.getElementById("template_container");
  templateContainer.classList.toggle("hidden");
});

//mercaributton
function footer_mercariopenWindow() {
  const externalWindow = window.open("https://www.mercari.com/jp/", "_blank");
  setTimeout(() => {
    if (externalWindow) {
      externalWindow.close();
    } else {
      console.log("ウィンドウを開けませんでした（ポップアップがブロックされた可能性があります）。");
    }
  }, 100);
}

//titlebutton
function footer_titleopenWindow() {
  window.open('https://mizumati802.github.io/title_create_app/', '_blank');
}





// ========= グローバル変数 =========
let currentTemplate = null; // 現在操作中のテンプレート要素
const existingProductNumbers = new Set(); // 生成済み商品番号を記憶して重複防止

// ページ読み込み時
document.addEventListener('DOMContentLoaded', function () {
  // ドロップダウン生成
  loadWordTemplates();

  // テンプレート項目クリックでポップアップ表示
  document.querySelectorAll(".template-item").forEach((item) => {
    item.addEventListener("click", () => {
      currentTemplate = item;
      openPopup();
    });
  });

  // クリアボタン
  document.getElementById('clear_templatebutton').addEventListener('click', resetDropdowns);

  // OKボタン
  document.getElementById("ok-button").addEventListener("click", handleOkButton);

  // キャンセルボタン
  document.getElementById("cancel-button").addEventListener("click", () => {
    // キャンセル時に入力フォームとドロップダウンをクリア
    const singleInput = document.getElementById('singleDynamicInput');
    if (singleInput) {
      singleInput.value = '';
    }
    resetDropdowns();
    closePopup();
  });

  // タイトルコピー
  document.getElementById("title-copy-button").addEventListener("click", () => {
    if (!currentTemplate) return;
    // 行頭の空白を削除
    const title = currentTemplate.querySelector("h3").textContent.replace(/^[ \t]+/gm, "");
    navigator.clipboard.writeText(title).then(() => {
      alert("タイトルをコピーしました。");
      updateTemplateContent();
      // ▼ コピー後にフォーム＆ドロップダウンをクリア
      const singleInput = document.getElementById('singleDynamicInput');
      if (singleInput) {
        singleInput.value = '';
      }
      resetDropdowns();
    });
  });

  // 説明コピー
  document.getElementById("description-copy-button").addEventListener("click", () => {
    if (!currentTemplate) return;
    // 行頭の空白を削除
    const description = (currentTemplate.getAttribute("data-txt") || "").replace(/^[ \t]+/gm, "");
    navigator.clipboard.writeText(description).then(() => {
      alert("説明をコピーしました。");
      updateTemplateContent();
      // ▼ コピー後にフォーム＆ドロップダウンをクリア
      const singleInput = document.getElementById('singleDynamicInput');
      if (singleInput) {
        singleInput.value = '';
      }
      resetDropdowns();
    });
  });
});

// ドロップダウン用テンプレートデータを生成して配置
async function loadWordTemplates() {
  const data = {
    success: true,
    items: [
      { category: 'Category 1', name: 'Template A', description: 'Description A' },
      { category: 'Category 1', name: 'Template B', description: 'Description B' },
      { category: 'Category 2', name: 'Template C', description: 'Description C' },
      { category: 'Category 2', name: 'Template D', description: 'Description D' }
    ]
  };

  if (!data.success) {
    console.error('データ取得に失敗:', data.message);
    return;
  }

  const container = document.getElementById('templateDropdownContainer');
  if (!container) {
    console.error('#templateDropdownContainer が見つかりません。');
    return;
  }
  container.innerHTML = ''; // 初期化

  // カテゴリごとにまとめる
  const templatesByCategory = data.items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  // カテゴリごとにドロップダウン生成
  Object.entries(templatesByCategory).forEach(([category, items]) => {
    const label = document.createElement('h3');
    label.textContent = category;
    container.appendChild(label);

    const dropdown = document.createElement('select');
    dropdown.classList.add('template-dropdown');
    dropdown.innerHTML = `<option value="">選択してください</option>`;

    items.forEach(item => {
      const option = document.createElement('option');
      option.value = item.description;
      option.textContent = item.name;
      dropdown.appendChild(option);
    });
    container.appendChild(dropdown);

    // ドロップダウンが変更されたら、単一のフォームに改行で追記
    dropdown.addEventListener('change', () => {
      const singleInput = document.getElementById('singleDynamicInput');
      if (!singleInput) return;
      const selectedVal = dropdown.value.trim();
      if (selectedVal) {
        if (singleInput.value !== '') {
          singleInput.value += '\n';
        }
        singleInput.value += selectedVal;
      }
    });
  });
}

// ドロップダウン初期化
function resetDropdowns() {
  const dropdowns = document.querySelectorAll('.template-dropdown');
  dropdowns.forEach(dropdown => {
    dropdown.value = '';
  });
  const singleInput = document.getElementById('singleDynamicInput');
  if (singleInput) {
    singleInput.value = '';
  }
}

// ポップアップを開く
function openPopup() {
  document.getElementById("popupOverlay").style.display = 'block';
  document.getElementById("popup").style.display = 'block';
}

// OKボタン
function handleOkButton() {
  if (!currentTemplate) return;

  let existingDataTxt = currentTemplate.getAttribute("data-txt") || "";
  if (existingDataTxt.includes("商品__")) {
    const randomProductNumber = generateRandomProductNumber();
    existingDataTxt = existingDataTxt.replace("商品__", randomProductNumber);
  }

  const singleInput = document.getElementById('singleDynamicInput');
  const inputLines = singleInput.value.split('\n').map(line => line.trim()).filter(line => line);

  const lines = existingDataTxt.split("\n");
  const index = lines.findIndex(line => line.trim() === "素材:");
  let insertPos = index + 2;
  let addedMaterialBlock = false;

  inputLines.forEach((val) => {
    if (index !== -1) {
      lines.splice(insertPos, 0, val);
      insertPos++;
    } else {
      if (!addedMaterialBlock) {
        lines.push("素材:", "");
        addedMaterialBlock = true;
      }
      lines.push(val);
    }
  });

  const updatedDataTxt = lines.join("\n");
  currentTemplate.setAttribute("data-txt", updatedDataTxt);

  const templateText = currentTemplate.querySelector("p");
  if (templateText) {
    templateText.textContent = updatedDataTxt;
  }
  singleInput.classList.add('bg_complete');
  setTimeout(() => {
    singleInput.classList.remove('bg_complete');
  }, 2000);
  
}

// 商品番号生成
function generateRandomProductNumber() {
  const prefix = "商品__";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomNumber;
  do {
    randomNumber =
      prefix +
      Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  } while (existingProductNumbers.has(randomNumber));
  existingProductNumbers.add(randomNumber);
  return randomNumber;
}

// コピー後にテンプレート内容を初期化に近い状態に戻す
function updateTemplateContent() {
  if (!currentTemplate) return;
  let existingDataTxt = currentTemplate.getAttribute("data-txt") || "";
  const lines = existingDataTxt.split("\n");

  // 「素材:」の行番号を取得
  const startIndex = lines.findIndex((line) => line.trim() === "素材:");
  // 「状態:」の行番号を取得
  const endIndex = lines.findIndex((line) => line.trim() === "状態:");

  // 「素材:」と「状態:」が見つかった場合、素材:～状態: 直前までを削除して空白行2行を追加
  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    lines.splice(startIndex + 1, endIndex - (startIndex + 1));
    lines.splice(startIndex + 1, 0, "", "");
  }

  // 商品__ で始まる行を削除
  const productLineIndex = lines.findIndex((line) => line.startsWith("商品__"));
  if (productLineIndex !== -1) {
    lines.splice(productLineIndex, 1);
  }

  // 先頭に「商品__」を追加
  lines.unshift("商品__");

  const updatedDataTxt = lines.join("\n");
  currentTemplate.setAttribute("data-txt", updatedDataTxt);

  const templateText = currentTemplate.querySelector("p");
  if (templateText) {
    templateText.textContent = updatedDataTxt;
  }
}

// ポップアップを閉じる
function closePopup() {
  document.getElementById("popupOverlay").style.display = 'none';
  document.getElementById("popup").style.display = 'none';
}
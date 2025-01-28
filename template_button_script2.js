document.addEventListener("DOMContentLoaded", () => {
  const templatesContainer = document.getElementById("templates-container");
  const titleInput = document.getElementById("title-input");
  const txtInput = document.getElementById("txt-input");
  const addTemplateButton = document.getElementById("add-template");
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const deleteTemplateButton = document.getElementById("delete-template");

  function copyToClipboard(text, element) {
    if (text.includes("商品__")) {
      const randomProductNumber = generateRandomProductNumber();
      text = text.replace("商品__", "");
      text = `${randomProductNumber} ${text}`;
    }

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() => highlightElement(element))
        .catch((err) => {
          console.error("Clipboard error:", err);
          fallbackCopyToClipboard(text, element);
        });
    } else {
      fallbackCopyToClipboard(text, element);
    }
  }

  function fallbackCopyToClipboard(text, element) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      highlightElement(element);
    } catch (err) {
      console.error("Fallback copy failed:", err);
    }
    document.body.removeChild(textArea);
  }

  function highlightElement(element) {
    const originalBackground = element.style.backgroundColor;
    element.style.backgroundColor = "#333333";
    setTimeout(() => {
      element.style.backgroundColor = originalBackground;
    }, 2000);
  }

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

            item.addEventListener("click", () => {
              const textToCopy = item.dataset.txt;
              copyToClipboard(textToCopy, item);
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







// 動的データ例
const dropdownData = {
  1: ["sample1", "sample2", "sample3"],
  2: ["sample1", "sample2", "sample3"],
  3: ["sample1", "sample2", "sample3"],
};

// 商品番号生成用
const existingProductNumbers = new Set();

function generateRandomProductNumber() {
  const prefix = "商品__";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomNumber;

  do {
    randomNumber =
      prefix +
      Array.from(
        { length: 3 },
        () => chars[Math.floor(Math.random() * chars.length)]
      ).join("");
  } while (existingProductNumbers.has(randomNumber)); // 被りを避ける

  existingProductNumbers.add(randomNumber);
  return randomNumber;
}

// ポップアップ操作
const popup = document.getElementById("popup");
const dynamicDropdown = document.getElementById("dynamic-dropdown");
const dynamicForms = document.getElementById("dynamic-forms");
const copyPopup = document.getElementById("copy-popup"); // 新しいポップアップ
let currentTemplate = null; // 選択中のテンプレートを記憶

// 修正: template-itemにイベントリスナーを追加
document.querySelectorAll(".template-item").forEach((item) => {
  item.addEventListener("click", () => {
    currentTemplate = item; // 現在のテンプレートを記憶
    const templateId = item.getAttribute("data-id");
    openPopup(templateId);
  });
});

// ポップアップを開く
function openPopup(templateId) {
  // ドロップダウンを動的生成
  if (dropdownData[templateId]) {
    dynamicDropdown.innerHTML = dropdownData[templateId]
      .map((option) => `<option value="${option}">${option}</option>`)
      .join("");
  } else {
    dynamicDropdown.innerHTML = "<option>データがありません</option>";
  }

  // 編集フォームをリセット
  dynamicForms.innerHTML = "";

  // ポップアップを表示
  popup.classList.remove("hidden");
}

// OKボタンの処理
document.getElementById("ok-button").addEventListener("click", () => {
  const selectedOption = dynamicDropdown.value; // ドロップダウンで選択された値

  // 現在のテンプレートに data-txt を追加
  if (currentTemplate) {
    let existingDataTxt = currentTemplate.getAttribute("data-txt") || ""; // 既存の値を取得
    
    // 商品番号をランダム生成して挿入
    if (existingDataTxt.includes("商品__")) {
      const randomProductNumber = generateRandomProductNumber();
      existingDataTxt = existingDataTxt.replace("商品__", randomProductNumber); // プレースホルダーを置き換え
    }

    // 「素材:」を探し、その2行下に追加
    const lines = existingDataTxt.split("\n"); // 改行で分割
    const index = lines.findIndex(line => line.trim() === "素材:"); // 「素材:」の行を探す

    if (index !== -1) {
      // 「素材:」の2行下に追加
      lines.splice(index + 2, 0, selectedOption);
    } else {
      // 「素材:」が見つからない場合、末尾に追加
      lines.push("素材:", "", selectedOption);
    }

    const updatedDataTxt = lines.join("\n"); // 配列を改行で結合
    currentTemplate.setAttribute("data-txt", updatedDataTxt);

    // オプションでテンプレート内に表示を更新
    const templateText = currentTemplate.querySelector("p");
    if (templateText) {
      templateText.textContent = updatedDataTxt; // 挿入されたテキストを表示
    }
  }

  // 元のポップアップを閉じ、新しいポップアップを表示
  closePopup();
  showCopyPopup();
});

// コピー用ポップアップを表示
function showCopyPopup() {
  copyPopup.classList.remove("hidden");

  // タイトルcopyボタンの動作
  document.getElementById("title-copy-button").addEventListener("click", () => {
    const title = currentTemplate.querySelector("h3").textContent;
    navigator.clipboard.writeText(title).then(() => {
      alert("タイトルがコピーされました！");
    });
  });

  // 説明copyボタンの動作
  document.getElementById("description-copy-button").addEventListener("click", () => {
    const description = currentTemplate.getAttribute("data-txt");
    navigator.clipboard.writeText(description).then(() => {
      alert("説明がコピーされました！");
    });
  });
}

// キャンセルボタンの処理
document.getElementById("cancel-button").addEventListener("click", closePopup);

// ポップアップを閉じる
function closePopup() {
  popup.classList.add("hidden");
  copyPopup.classList.add("hidden"); // コピー用ポップアップも閉じる
}

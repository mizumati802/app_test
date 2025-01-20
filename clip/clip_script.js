document.addEventListener("DOMContentLoaded", () => {
  const clipsContainer = document.getElementById("clips-container");
  const titleInput = document.getElementById("title-input");
  const txtInput = document.getElementById("txt-input");
  const addClipButton = document.getElementById("add-clip");
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");

  function loadClips() {
    fetch("/get_clips")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          clipsContainer.innerHTML = data.clips
            .map(
              (clip) => `
              <div class="clip">
                <h3>${clip.title}</h3>
                <p>${clip.txt}</p>
                <button class="copy-clip" data-id="${clip.id}">Copy</button>
              </div>
              `
            )
            .join("");

          // 各コピーボタンにイベントリスナーを追加
          const copyButtons = document.querySelectorAll(".copy-clip");
          copyButtons.forEach((button) => {
            button.addEventListener("click", () => {
              const id = button.dataset.id;
              copyClipById(id);
            });
          });
        }
      })
      .catch((error) => console.error("Error:", error));
  }

  function copyClipById(id) {
    fetch(`/get_clip?id=${id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const textToCopy = data.clip.txt;

          // クリップボードにコピーするロジック
          if (navigator.clipboard) {
            navigator.clipboard
              .writeText(textToCopy)
              .then(() => alert("Copied to clipboard!"))
              .catch((err) => console.error("Clipboard error:", err));
          } else {
            // Fallback for unsupported browsers
            const textArea = document.createElement("textarea");
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            try {
              document.execCommand("copy");
              alert("Copied to clipboard!");
            } catch (err) {
              console.error("Fallback copy failed:", err);
            }
            document.body.removeChild(textArea);
          }
        } else {
          alert(data.message);
        }
      })
      .catch((error) => console.error("Error:", error));
  }

  addClipButton.addEventListener("click", () => {
    const title = titleInput.value.trim();
    const txt = txtInput.value.trim();

    if (title && txt) {
      fetch("/add_clip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, txt }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            loadClips();
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
      fetch(`/search_clips?query=${encodeURIComponent(query)}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            clipsContainer.innerHTML = data.clips
              .map(
                (clip) => `
                <div class="clip">
                  <h3>${clip.title}</h3>
                  <p>${clip.txt}</p>
                  <button class="copy-clip" data-id="${clip.id}">Copy</button>
                </div>
                `
              )
              .join("");
          } else {
            clipsContainer.innerHTML = "<p>No matching clips found.</p>";
          }
        })
        .catch((error) => console.error("Error:", error));
    } else {
      alert("Please enter a search query.");
    }
  });

  loadClips();
});

//商品番号作成script

// 商品番号の既存リスト
const existingProductNumbers = new Set();

// ランダムな商品番号を生成する関数
function generateRandomProductNumber() {
  const prefix = "R商品__";
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

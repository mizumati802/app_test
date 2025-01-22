// HTML要素の取得
const buttons = document.querySelectorAll(".number-button");
const sendButton = document.querySelector("#submit-button");
const settingButton = document.querySelector("#settings-button");
const displayZone = document.querySelector("#display-zone");
let currentSequence = "";


// ボタンが押されたときの処理
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const number = button.dataset.number;
    currentSequence += number;
    updateDisplay();
  });
});

// 送信ボタンが押されたときの処理
sendButton.addEventListener("click", () => {
  if (currentSequence) {
    // 新しいウィンドウを最初に開く
    const newWindow = window.open("about:blank", "_blank");

    fetch("/get_url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ combination: currentSequence }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.url) {
          newWindow.location.href = data.url; // 新しいウィンドウにURLを設定
          window.close(); // 現在のウィンドウを閉じる
        } else {
          newWindow.close(); // URLがない場合は新しいウィンドウを閉じる
          alert("該当するURLがありません");
        }
      })
      .catch((error) => {
        console.error("エラー:", error);
        newWindow.close(); // エラー時もウィンドウを閉じる
        alert("エラーが発生しました");
      });
  } else {
    alert("ボタンを押して数字を入力してください");
  }
});

// 設定ボタンが押されたときの処理
settingButton.addEventListener("click", () => {
  const popup = document.querySelector("#setting-popup");
  popup.style.display = "block";

  const closeButton = document.querySelector("#close-popup");
  closeButton.addEventListener("click", () => {
    popup.style.display = "none";
  });

  const registerButton = document.querySelector("#register-button");
  registerButton.addEventListener("click", () => {
    const sequenceInput = document.querySelector("#sequence-input").value;
    const nameInput = document.querySelector("#name-input").value;
    const urlInput = document.querySelector("#url-input").value;

    if (sequenceInput && nameInput && urlInput) {
      fetch("/dashboard_register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          combination: sequenceInput,
          title: nameInput,
          url: urlInput,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert("登録が完了しました");
            popup.style.display = "none";
          } else {
            alert(`登録に失敗しました: ${data.message}`);
          }
        })
        .catch((error) => {
          console.error("エラー:", error);
          alert("エラーが発生しました");
        });
    } else {
      alert("すべてのフィールドを入力してください");
    }
  });
});

// 表示を更新する関数
// 表示を更新する関数
function updateDisplay() {
  fetch(`/get_titles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ combination: currentSequence }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // 表示するタイトルのリストを生成
        const titleList = data.titles
          .map(
            (item) =>
              `<li>${item.combination} → ${item.title} 
              <button class="delete-button" data-combination="${item.combination}">削除</button></li>`
          )
          .join("");
        displayZone.innerHTML = `<p>現在の入力: ${
          currentSequence || "未入力"
        }</p><ul>${titleList}</ul>`;

        // 各削除ボタンにイベントリスナーを追加
        document.querySelectorAll(".delete-button").forEach((button) => {
          button.addEventListener("click", () => {
            const combination = button.dataset.combination;
            deleteData(combination);
          });
        });
      } else {
        displayZone.innerHTML = `<p>現在の入力: ${
          currentSequence || "未入力"
        }</p><p>${data.message}</p>`;
      }
    })
    .catch((error) => {
      console.error("エラー:", error);
      displayZone.innerHTML = `<p>エラーが発生しました</p>`;
    });
}

// データ削除の関数
function deleteData(combination) {
  fetch("/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ combination }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // 削除成功時にリストを更新
        updateDisplay();
      } else {
        // 削除失敗時のエラーメッセージを表示
        displayZone.innerHTML += `<p>削除に失敗しました: ${data.message}</p>`;
      }
    })
    .catch((error) => {
      console.error("エラー:", error);
      displayZone.innerHTML += `<p>削除中にエラーが発生しました</p>`;
    });
}

// クリックで色を変える

let isFirstClick = true;

document.querySelectorAll(".number-button").forEach((button) => {
  button.addEventListener("click", (e) => {
    if (isFirstClick) {
      const number = e.target.dataset.number;
      document.body.classList.remove("bg-1", "bg-2", "bg-3", "bg-4"); // Reset existing classes
      switch (number) {
        case "1":
          document.body.classList.add("bg-1");
          break;
        case "2":
          document.body.classList.add("bg-2");
          break;
        case "3":
          document.body.classList.add("bg-3");
          break;
        case "4":
          document.body.classList.add("bg-4");
          break;
      }
      isFirstClick = false;
    }
  });
});


function mercariopenWindow() {
  // 新しいウィンドウを開く（指定URL）
  const externalWindow = window.open("youtube.com", "_blank");

  // ウィンドウを0.1秒（100ミリ秒）後に閉じる
  setTimeout(() => {
    if (externalWindow) {
      externalWindow.close();
    } else {
      console.log("ウィンドウを開けませんでした（ポップアップがブロックされた可能性があります）。");
    }
  }, 100); // 100ミリ秒
}

  // ウィンドウを0.1秒（100ミリ秒）後に閉じる
  setTimeout(() => {
    if (externalWindow) {
      externalWindow.close();
    } else {
      console.log("ウィンドウを開けませんでした（ポップアップがブロックされた可能性があります）。");
    }
  }, 100); // 100ミリ秒



function gptopenWindow() {
  const url = "chatgpt://example"; // chatgpt:// スキーム付きのURL
  window.location.href = url;
  setTimeout(() => {
    window.close();
  }, 500);
}



// ボタンにイベントリスナーを追加
document.getElementById('Reload-button').addEventListener('click', function() {
  location.reload(); // 画面をリロードする
});


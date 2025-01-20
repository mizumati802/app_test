document.addEventListener("DOMContentLoaded", () => {
  const noteList = document.getElementById("note-list");
  const notesContainer = document.getElementById("notes-container");
  const toggleNoteListButton = document.getElementById("toggle-note-list");
  const closeNoteListButton = document.getElementById("close-note-list");
  const titleInput = document.getElementById("title-input");
  const txtInput = document.getElementById("txt-input");
  const addNoteButton = document.getElementById("add-note");
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");

  function loadNotes() {
    fetch("/get_notes")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          notesContainer.innerHTML = data.notes
            .map(
              (note) => `
              <div class="note">
                <h3>${note.title}</h3>
                <p>${note.txt}</p>
                <button class="delete-note" data-id="${note.id}">Delete</button>
              </div>
              `
            )
            .join("");

          // 各削除ボタンにイベントリスナーを追加
          const deleteButtons = document.querySelectorAll(".delete-note");
          deleteButtons.forEach((button) => {
            button.addEventListener("click", () => {
              const id = button.dataset.id;
              deleteNoteById(id);
            });
          });
        }
      })
      .catch((error) => console.error("Error:", error));
  }

  function deleteNoteById(id) {
    fetch("/delete_note", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          loadNotes(); // ノートリストを再取得
        } else {
          alert(data.message);
        }
      })
      .catch((error) => console.error("Error:", error));
  }

  // ノートを追加
  addNoteButton.addEventListener("click", () => {
    const title = titleInput.value.trim();
    const txt = txtInput.value.trim();

    if (title && txt) {
      fetch("/add_note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, txt }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            loadNotes();
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

  // 検索機能
  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();

    if (query) {
      fetch(`/search_notes?query=${encodeURIComponent(query)}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            notesContainer.innerHTML = data.notes
              .map(
                (note) => `
                <div class="note">
                  <h3>${note.title}</h3>
                  <p>${note.txt}</p>
                  <button class="delete-note" data-id="${note.id}">Delete</button>
                </div>
                `
              )
              .join("");

            // 削除ボタンのイベントリスナーを再追加
            const deleteButtons = document.querySelectorAll(".delete-note");
            deleteButtons.forEach((button) => {
              button.addEventListener("click", () => {
                const id = button.dataset.id;
                deleteNoteById(id);
              });
            });
          } else {
            notesContainer.innerHTML = "<p>No matching notes found.</p>";
          }
        })
        .catch((error) => console.error("Error:", error));
    } else {
      alert("Please enter a search query.");
    }
  });

  // トグルボタンで表示/非表示を切り替え
  toggleNoteListButton.addEventListener("click", () => {
    noteList.classList.toggle("hidden");
  });

  // 閉じるボタンで非表示
  closeNoteListButton.addEventListener("click", () => {
    noteList.classList.add("hidden");
  });

  loadNotes();
});

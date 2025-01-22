document.addEventListener("DOMContentLoaded", () => {
  const clipsContainer = document.getElementById("dashboard_custom_assistant_clips-container");
  const titleInput = document.getElementById("dashboard_custom_assistant_title-input");
  const txtInput = document.getElementById("dashboard_custom_assistant_txt-input");
  const addClipButton = document.getElementById("dashboard_custom_assistant_add-clip");
  const searchInput = document.getElementById("dashboard_custom_assistant_search-input");
  const searchButton = document.getElementById("dashboard_custom_assistant_search-button");
  const toggleButton = document.getElementById("dashboard_custom_assistant_toggleButton");
  const clipContainer = document.getElementById("dashboard_custom_assistant_container");

  function loadClips() {
    fetch("/get_clips")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          clipsContainer.innerHTML = data.clips
            .map(
              (clip) => `
              <div class="clip-item">
                <h3>${clip.title}</h3>
                <p>${clip.txt}</p>
                <button class="copy-clip" data-id="${clip.id}">Copy</button>
              </div>
              `
            )
            .join("");

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

          if (navigator.clipboard) {
            navigator.clipboard
              .writeText(textToCopy)
              .then(() => alert("Copied to clipboard!"))
              .catch((err) => console.error("Clipboard error:", err));
          } else {
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
                <div class="clip-item">
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

  toggleButton.addEventListener("click", () => {
    clipContainer.classList.toggle("dashboard_custom_assistant_hidden");
  });

  loadClips();
});


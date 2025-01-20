document.addEventListener("DOMContentLoaded", () => {
  const templatesContainer = document.getElementById("templates-container");
  const titleInput = document.getElementById("title-input");
  const txtInput = document.getElementById("txt-input");
  const addTemplateButton = document.getElementById("add-template");
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");

  function loadTemplates() {
    fetch("/get_templates")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          templatesContainer.innerHTML = data.templates
            .map(
              (template) => `
              <div class="template-item">
                <h3>${template.title}</h3>
                <p>${template.txt}</p>
                <button class="copy-template" data-id="${template.id}">Copy</button>
              </div>
              `
            )
            .join("");

          const copyButtons = document.querySelectorAll(".copy-template");
          copyButtons.forEach((button) => {
            button.addEventListener("click", () => {
              const id = button.dataset.id;
              copyTemplateById(id);
            });
          });
        }
      })
      .catch((error) => console.error("Error:", error));
  }

  function copyTemplateById(id) {
    fetch(`/get_template?id=${id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const textToCopy = data.template.txt;

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
                <div class="template">
                  <h3>${template.title}</h3>
                  <p>${template.txt}</p>
                  <button class="copy-template" data-id="${template.id}">Copy</button>
                </div>
                `
              )
              .join("");
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

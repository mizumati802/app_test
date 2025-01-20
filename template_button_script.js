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
              <div class="template-item" data-id="${template.id}" data-txt="${template.txt}">
                <h3>${template.title}</h3>
                <p>${template.txt}</p>
                <button class="delete-template-button">削除</button>
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

  function copyToClipboard(text, element) {
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
                  <button class="delete-template-button">削除</button>
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

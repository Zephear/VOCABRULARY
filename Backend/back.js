let allTerms = [];
let filteredTerms = [];
let currentPage = 0;
const TERMS_PER_PAGE = 10;

function showPage(page) {
  document.querySelectorAll(".page-section").forEach((section) => {
    section.classList.remove("active");
  });
  const targetSection = document.getElementById(page + "-section");
  if (targetSection) targetSection.classList.add("active");

  document
    .querySelectorAll(".nav-link")
    .forEach((link) => link.classList.remove("active"));

  if (page === "home") {
    const link = document.querySelector(".nav-link:nth-child(1)");
    if (link) link.classList.add("active");
  } else if (page === "dictionary") {
    const link = document.querySelector(".nav-link:nth-child(2)");
    if (link) link.classList.add("active");
  }
}

function getLetterRange(range) {
  const ranges = {
    "А-Г": ["А", "Б", "В", "Г"],
    "Д-Ж": ["Д", "Е", "Є", "Ж"],
    "З-Л": ["З", "И", "І", "Ї", "Й", "К", "Л"],
    "М-П": ["М", "Н", "О", "П"],
    "Р-Т": ["Р", "С", "Т"],
    "У-Ш": ["У", "Ф", "Х", "Ц", "Ч", "Ш"],
    "Щ-Я": ["Щ", "Ь", "Ю", "Я"],
    "#": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  };
  return ranges[range] || [];
}

function updateAlphabetTitle(range) {
  const alphabetDiv = document.querySelector(".alphabet");
  if (alphabetDiv) {
    alphabetDiv.textContent = range;
  }
}

function filterTermsByLetter(range) {
  const letters = getLetterRange(range);

  if (range === "#") {
    filteredTerms = allTerms.filter((term) => /^[0-9]/.test(term.NameUA));
  } else {
    filteredTerms = allTerms.filter((term) => {
      const firstLetter = term.NameUA.charAt(0).toUpperCase();
      return letters.includes(firstLetter);
    });
  }

  currentPage = 0;
  updateAlphabetTitle(range);
  displayTerms(true);
}

function displayTerms(shouldScrollToTop = false) {
  const container = document.querySelector(".study-container");
  const buttonsContainer = container.querySelector(".buttons-container");

  container.style.minHeight = `${container.offsetHeight}px`;
  const termsElements = container.querySelectorAll(".terms");

  termsElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(-10px)";
  });

  setTimeout(() => {
    termsElements.forEach((el) => el.remove());

    const startIndex = currentPage * TERMS_PER_PAGE;
    const endIndex = Math.min(
      startIndex + TERMS_PER_PAGE,
      filteredTerms.length
    );
    const termsToShow = filteredTerms.slice(startIndex, endIndex);

    termsToShow.forEach((term, index) => {
      const item = document.createElement("div");
      item.className = "terms";
      item.style.opacity = "0";
      item.style.transform = "translateY(15px)";
      item.style.transition = "opacity 0.4s ease, transform 0.4s ease";

      item.innerHTML = `<p class="terms-text"><b>${term.NameUA} [${
        term.NameEN
      }]</b> – ${term.DescriptionUA || ""}</p>`;
      container.insertBefore(item, buttonsContainer);

      setTimeout(() => {
        item.style.opacity = "1";
        item.style.transform = "translateY(0)";
      }, 50 * index);
    });

    updateButtons();
    updatePageInfo();

    setTimeout(() => {
      container.style.minHeight = "0";
    }, 500);

    if (shouldScrollToTop) {
      smartScrollToTop();
    }
  }, 300);
}

function smartScrollToTop() {
  const container = document.querySelector(".study-container");
  const rect = container.getBoundingClientRect();
  if (rect.top < 0) {
    container.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function updateButtons() {
  const prevBtn = document.querySelector(".previous");
  const nextBtn = document.querySelector(".next");

  prevBtn.disabled = currentPage === 0;
  nextBtn.disabled = (currentPage + 1) * TERMS_PER_PAGE >= filteredTerms.length;

  prevBtn.style.opacity = prevBtn.disabled ? "0.5" : "1";
  prevBtn.style.cursor = prevBtn.disabled ? "not-allowed" : "pointer";
  nextBtn.style.opacity = nextBtn.disabled ? "0.5" : "1";
  nextBtn.style.cursor = nextBtn.disabled ? "not-allowed" : "pointer";
}

function updatePageInfo() {
  let pageInfo = document.querySelector(".page-info");
  if (!pageInfo) {
    pageInfo = document.createElement("div");
    pageInfo.className = "page-info";
    pageInfo.style.textAlign = "center";
    pageInfo.style.fontSize = "23px";
    pageInfo.style.marginTop = "30px";
    pageInfo.style.marginBottom = "30px";
    pageInfo.style.color = "#ebdefb";
    const buttonsContainer = document.querySelector(".buttons-container");
    buttonsContainer.parentNode.insertBefore(pageInfo, buttonsContainer);
  }

  const totalPages = Math.ceil(filteredTerms.length / TERMS_PER_PAGE);
  const current = filteredTerms.length > 0 ? currentPage + 1 : 0;

  pageInfo.textContent = `Сторінка ${current} з ${
    totalPages || 1
  } | Всього термінів: ${filteredTerms.length}`;
}

async function loadTerms() {
  try {
    const response = await fetch("http://127.0.0.1:3001/api/terms");
    if (!response.ok) throw new Error("Network response was not ok");

    allTerms = await response.json();
    filteredTerms = allTerms;
    currentPage = 0;
    filterTermsByLetter("А-Г");
  } catch (error) {
    console.error("Помилка завантаження термінів:", error);
    const container = document.querySelector(".study-container");
    const errorMsg = document.createElement("p");
    errorMsg.style.cssText =
      "color: red; text-align: center; margin-top: 20px;";
    errorMsg.textContent =
      "Не вдалося завантажити терміни. Перевірте з'єднання з сервером.";
    container.appendChild(errorMsg);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadTerms();

  const prevBtn = document.querySelector(".previous");
  const nextBtn = document.querySelector(".next");

  prevBtn.addEventListener("click", () => {
    if (currentPage > 0) {
      currentPage--;
      displayTerms(true);
    }
  });

  nextBtn.addEventListener("click", () => {
    if ((currentPage + 1) * TERMS_PER_PAGE < filteredTerms.length) {
      currentPage++;
      displayTerms(true);
    }
  });

  document.querySelectorAll(".alpha-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document
        .querySelectorAll(".alpha-btn")
        .forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");

      const range = e.target.getAttribute("data-range");
      filterTermsByLetter(range);
    });
  });
});

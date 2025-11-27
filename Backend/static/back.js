function showPage(page) {
  document.querySelectorAll('.page-section').forEach(section => {
    section.classList.remove('active');
  });
  document.getElementById(page + '-section').classList.add('active');
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  if (page === 'home') {
    document.querySelector('.nav-link:nth-child(1)').classList.add('active');
  } else if (page === 'dictionary') {
    document.querySelector('.nav-link:nth-child(2)').classList.add('active');
    filteredTerms = allTerms;
	displayTerms();
  }
  else if (page === 'saved-terms') {
    document.querySelector('.nav-link:nth-child(3)').classList.add('active');
    filteredTerms = allTerms.filter(t => t.Favorite == 1);
	displayTerms(true);
  }
}

// Пагінація та переключання термінів
let allTerms = [];
let filteredTerms = [];
let currentPage = 0;
const TERMS_PER_PAGE = 10;

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

// Функція для фільтрації термінів за літерою
function filterTermsByLetter(range, saved=false) {
  const letters = getLetterRange(range);

  if (range === "#") {
    if (saved) {
      filteredTerms = allTerms.filter(t => t.Favorite == 1 && /^[0-9]/.test(t.NameUA));
    } else {
      filteredTerms = allTerms.filter((term) => /^[0-9]/.test(term.NameUA));
    }
  } else {
    if (saved) {
      filteredTerms = allTerms.filter(t => t.Favorite == 1 && letters.includes(t.NameUA.charAt(0).toUpperCase()));
    } else {
      filteredTerms = allTerms.filter((term) => {
        const firstLetter = term.NameUA.charAt(0).toUpperCase();
        return letters.includes(firstLetter);
      });
    }
  }

  currentPage = 0;
  displayTerms();
  updateAlphabetTitle(range, saved);
}

// Оновлення заголовка алфавіту
function updateAlphabetTitle(range, saved=false) {
  let parent;
  if (saved) {
    parent = document.querySelector("#saved-container");
  } else {
    parent = document.querySelector(".study-container"); // first dictionary container
  }
  if (!parent) return;
  const alphabetDiv = parent.querySelector(".alphabet");
  if (alphabetDiv) alphabetDiv.textContent = range;
}

// Відображення термінів поточної сторінки
function displayTerms(saved=false) {
  const container = saved ? 
	document.querySelector("#saved-container") :
	document.querySelector(".study-container");
  if (!container) return;
  
  let termsToDisplay = saved
    ? allTerms.filter(t => t.Favorite == 1)
    : allTerms;

  const termsElements = container.querySelectorAll(".terms");
  termsElements.forEach((el) => el.remove());

  const alphabetDiv = container.querySelector(".alphabet");
  const buttonsContainer = container.querySelector(".buttons-container");
  
  const startIndex = currentPage * TERMS_PER_PAGE;
  const endIndex = Math.min(startIndex + TERMS_PER_PAGE, filteredTerms.length);
  const termsToShow = filteredTerms.slice(startIndex, endIndex);

  // Додаємо терміни між алфавітом і кнопками
  termsToShow.forEach((term) => {
    const item = document.createElement("div");
    item.className = "terms";
    item.innerHTML = `
		<div class="terms-row">
			<span class="favorite" data-id="${term.ID}">
				${term.Favorite ? "★" : "☆"}
			</span>
			
			<p class="terms-text"><b>${term.NameUA} [${
			  term.NameEN
			}]</b> – ${term.Description}</p>
		</div>
    `;
    container.insertBefore(item, buttonsContainer);
  
    const star = item.querySelector(".favorite");
    star.addEventListener("click", async () => {
      const id = star.dataset.id;
      const newState = term.Favorite ? 0 : 1;

      await fetch(`http://127.0.0.1:3001/api/favorite/${id}/${newState}`, { method: "POST" });
	  
      term.Favorite = newState;
      star.textContent = newState ? "★" : "☆";
	  
	  const idx = allTerms.findIndex(t => t.ID == term.ID);
	  if (idx !== -1) allTerms[idx].Favorite = newState;
	  displayTerms(saved);
    });
  });

  updateButtons();
  updatePageInfo();
}

// Оновлення стану кнопок
function updateButtons() {
  const prevBtn = document.querySelector(".previous");
  const nextBtn = document.querySelector(".next");

  prevBtn.disabled = currentPage === 0;
  nextBtn.disabled = (currentPage + 1) * TERMS_PER_PAGE >= filteredTerms.length;

  // Додаємо стилі для неактивних кнопок
  prevBtn.style.opacity = prevBtn.disabled ? "0.5" : "1";
  prevBtn.style.cursor = prevBtn.disabled ? "not-allowed" : "pointer";
  nextBtn.style.opacity = nextBtn.disabled ? "0.5" : "1";
  nextBtn.style.cursor = nextBtn.disabled ? "not-allowed" : "pointer";
}

// Додавання інформації про сторінки
function updatePageInfo() {
  let pageInfo = document.querySelector(".page-info");
  if (!pageInfo) {
    pageInfo = document.createElement("div");
    pageInfo.className = "page-info";
    pageInfo.style.textAlign = "center";
    pageInfo.style.margin = "15px 0";
    pageInfo.style.color = "#666";
    const buttonsContainer = document.querySelector(".buttons-container");
    buttonsContainer.parentNode.insertBefore(pageInfo, buttonsContainer);
  }

  const totalPages = Math.ceil(filteredTerms.length / TERMS_PER_PAGE);
  pageInfo.textContent = `Сторінка ${
    currentPage + 1
  } з ${totalPages} | Термінів: ${filteredTerms.length}`;
}

// Завантаження термінів з сервера
async function loadTerms() {
  try {
    const response = await fetch("http://127.0.0.1:3001/api/terms");
    allTerms = await response.json();

    filteredTerms = allTerms;
    currentPage = 0;
    displayTerms();
  } catch (error) {
    console.error("Помилка завантаження термінів:", error);
    const container = document.querySelector(".study-container");
    container.innerHTML +=
      '<p style="color: red; text-align: center;">Помилка завантаження термінів</p>';
  }
}

// Ініціалізація при завантаженні сторінки
document.addEventListener("DOMContentLoaded", () => {
  loadTerms();

  // Обробники для кнопок пагінації
  document.querySelector(".previous").addEventListener("click", () => {
    if (currentPage > 0) {
      currentPage--;
      displayTerms();
      window.scrollTo({
        top: document.querySelector("#dictionary-section").offsetTop,
        behavior: "smooth",
      });
    }
  });

  document.querySelector(".next").addEventListener("click", () => {
    if ((currentPage + 1) * TERMS_PER_PAGE < filteredTerms.length) {
      currentPage++;
      displayTerms();
      window.scrollTo({
        top: document.querySelector("#dictionary-section").offsetTop,
        behavior: "smooth",
      });
    }
  });

  // Обробники для кнопок алфавіту
  document.querySelectorAll(".alpha-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document
        .querySelectorAll(".alpha-btn")
        .forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");

      const range = e.target.getAttribute("data-range");
      filterTermsByLetter(range);
      window.scrollTo({
        top: document.querySelector("#dictionary-section").offsetTop,
        behavior: "smooth",
      });
    });
  });
});

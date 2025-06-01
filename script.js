let questions = [];
let currentQuestionIndex = 0;
let selectedAnswer = null;
let tokens = 10;

// Funkce pro zamíchání pole (Fisher-Yates shuffle)
function shuffleArray(array) {
  let shuffled = array.slice(); // kopie pole
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ====== Cookies: načítání & ukládání ======
function getCookie(name) {
  let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? parseInt(match[2]) : null;
}

function setCookie(name, value, days = 365) {
  let expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + value + '; expires=' + expires + '; path=/';
}

function updateTokenDisplay() {
  document.getElementById("tokens").textContent = tokens;
  setCookie("tokens", tokens);
}

// ====== Check for #get in URL ======
function handleHashGet() {
  if (window.location.hash === "#get") {
    tokens = getCookie("tokens") || 0;
    tokens += 1;
    setCookie("tokens", tokens);
    window.location.href = window.location.pathname; // remove #get
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Načti tokeny z cookies
  tokens = getCookie("tokens");
  if (tokens === null || isNaN(tokens)) tokens = 10;

  updateTokenDisplay();
  handleHashGet();

  // Načti otázky a zamíchej je
  fetch("questions.json")
    .then(res => res.json())
    .then(data => {
      questions = shuffleArray(data);
      showQuestion();
    });
});

function showQuestion() {
  if (tokens <= 0) {
    document.getElementById("question-box").innerHTML = `
      <p>Nemáš žádné tokeny.</p>
      <p><a href="http://adfoc.us/871508110033103" target="_top">Klikni zde pro dobití ➕</a></p>
    `;
    return;
  }

  selectedAnswer = null;
  const q = questions[currentQuestionIndex];
  document.getElementById("question").textContent = q.question;
  
  const optionsHTML = ['a','b','c','d'].map(letter => `
    <label>
      <input type="radio" name="answer" value="${letter}">
      (${letter.toUpperCase()}) ${q[letter]}
    </label><br>
  `).join('');
  document.getElementById("options").innerHTML = optionsHTML;
}

function submitAnswer() {
  const answerEl = document.querySelector('input[name="answer"]:checked');
  if (!answerEl) return alert("Vyber odpověď!");

  const answer = answerEl.value;
  const correct = questions[currentQuestionIndex].correct;

  tokens -= 1;

  if (answer === correct) {
    tokens += 2;
    document.getElementById("feedback").textContent = "✅ Správně! +2 tokeny";
  } else {
    document.getElementById("feedback").textContent = "❌ Špatně. -1 token";
  }

  updateTokenDisplay();

  // další otázka - náhodná
  currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;

  setTimeout(() => {
    document.getElementById("feedback").textContent = "";
    showQuestion();
  }, 1500);
}

function addTokens() {
  window.open("http://adfoc.us/871508110033103", "_top");
}

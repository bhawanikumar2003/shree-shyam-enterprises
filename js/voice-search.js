/* ==========================================================================
   SHREE SHYAM ENTERPRISES - VOICE SEARCH ENGINE (js/voice-search.js)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initVoiceSearch();
});

function initVoiceSearch() {
  const searchInputs = [
    document.getElementById('header-search-input'),
    document.getElementById('catalog-search-input')
  ].filter(Boolean);

  if (searchInputs.length === 0) return;

  searchInputs.forEach(input => {
    // Check if mic button already exists
    const parent = input.parentElement;
    if (!parent || parent.querySelector('.mic-search-btn')) return;

    const micBtn = document.createElement('button');
    micBtn.type = 'button';
    micBtn.className = 'mic-search-btn';
    micBtn.setAttribute('aria-label', 'Search by Voice');
    micBtn.setAttribute('title', 'Search by Voice (आवाज़ से खोजें)');
    micBtn.innerHTML = `<i class="fas fa-microphone"></i>`;

    parent.appendChild(micBtn);

    // Speech Recognition API Check
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      micBtn.addEventListener('click', () => {
        showToast('Voice Search is not supported on this browser. Please type to search.', 'info');
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'hi-IN'; // Hindi (India) primary recognition

    micBtn.addEventListener('click', () => {
      try {
        if (micBtn.classList.contains('listening')) {
          recognition.stop();
          return;
        }

        recognition.start();
        micBtn.classList.add('listening');
        micBtn.innerHTML = `<i class="fas fa-microphone-slash pulse-glow" style="color:var(--danger-red);"></i>`;
        showToast('Listening... Speak product name in Hindi or English', 'info');
      } catch (err) {
        console.error('Voice search error:', err);
      }
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      input.value = transcript;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      showToast(`Searching for: "${transcript}"`, 'success');
      micBtn.classList.remove('listening');
      micBtn.innerHTML = `<i class="fas fa-microphone"></i>`;
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      micBtn.classList.remove('listening');
      micBtn.innerHTML = `<i class="fas fa-microphone"></i>`;
      showToast('Could not recognize voice. Please try again.', 'info');
    };

    recognition.onend = () => {
      micBtn.classList.remove('listening');
      micBtn.innerHTML = `<i class="fas fa-microphone"></i>`;
    };
  });
}

window.initVoiceSearch = initVoiceSearch;

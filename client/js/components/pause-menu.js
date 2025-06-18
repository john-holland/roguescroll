// Add philosopher voice options
const philosopherVoices = [
  { label: 'Frederick Nietzsche', value: 'nietzsche' },
  { label: 'Simone de Beauvoir', value: 'beauvoir' },
  { label: 'Confucius', value: 'confucius' },
  { label: 'bell hooks', value: 'bell_hooks' },
  { label: 'Socrates', value: 'socrates' },
  { label: 'Hannah Arendt', value: 'arendt' }
];

function renderPhilosopherSection(sshCompromised) {
  if (sshCompromised) {
    return `<div class="ssh-warning">SSH compromised, please contact your service provider, and go out to buy a local Newspaper!</div>`;
  }
  return `
    <div class="philosophy-section">
      <h3>Philosopher Voice</h3>
      <form id="philosopher-voices">
        ${philosopherVoices.map(v => `<label><input type="radio" name="philosopherVoice" value="${v.value}"> ${v.label}</label>`).join('<br>')}
      </form>
      <textarea id="philosophyPrompt">We would like to discuss the philosophical impact of today's news, with a hopeful outlook while keeping in mind random tragedy and an eye towards social working support.</textarea>
      <button onclick="getPhilosophicalDiscussion()">Get Reflection</button>
      <div id="philosophyResult"></div>
    </div>
  `;
} 
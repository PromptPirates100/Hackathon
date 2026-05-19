// app.js — Emergency Intake Panel logic

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('intake-form');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const triagePanel = document.getElementById('triagePanel');
  const reasoningPanel = document.getElementById('reasoningPanel');
  const steps = [
    document.getElementById('step-1'),
    document.getElementById('step-2'),
    document.getElementById('step-3'),
    document.getElementById('step-4')
  ];

  const stepTexts = [
    'Analyzing emergency severity...',
    'Running triage intelligence...',
    'Evaluating logistics & hospital availability...',
    'Generating action plan...'
  ];

  function resetSteps() {
    steps.forEach((step, i) => {
      if (!step) return;
      step.className = 'pending';
      step.innerHTML = `<span class="icon dot"></span> ${stepTexts[i]}`;
    });
  }

  function markDone(step, text) {
    step.className = 'done';
    step.innerHTML = `<span class="icon">✓</span> ${text}`;
  }

  function markActive(step, text) {
    step.className = 'active';
    step.innerHTML = `<span class="icon spinner"></span> ${text}`;
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Hide results
      if (triagePanel) triagePanel.style.display = 'none';
      if (reasoningPanel) reasoningPanel.style.display = 'none';

      resetSteps();
      analyzeBtn.textContent = 'Analyzing...';
      analyzeBtn.disabled = true;

      let current = 0;
      const interval = setInterval(() => {
        if (current > 0 && steps[current - 1]) markDone(steps[current - 1], stepTexts[current - 1]);
        if (current < steps.length) {
          if (steps[current]) markActive(steps[current], stepTexts[current]);
          current++;
        } else {
          clearInterval(interval);
          if (steps[steps.length - 1]) markDone(steps[steps.length - 1], stepTexts[steps.length - 1]);

          // Show results
          if (triagePanel) { triagePanel.style.display = 'block'; triagePanel.style.animation = 'fadeIn 0.4s ease'; }
          if (reasoningPanel) { reasoningPanel.style.display = 'block'; reasoningPanel.style.animation = 'fadeIn 0.4s ease'; }

          analyzeBtn.textContent = '✓ Analysis Complete';
          analyzeBtn.style.background = '#16a34a';
          setTimeout(() => {
            analyzeBtn.textContent = 'Analyze Emergency Severity';
            analyzeBtn.style.background = '';
            analyzeBtn.disabled = false;
          }, 3000);
        }
      }, 900);
    });
  }

  // Upload buttons
  document.querySelectorAll('.upload-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orig = btn.textContent;
      btn.textContent = 'Uploading...';
      setTimeout(() => {
        btn.textContent = '✓ Uploaded';
        btn.style.color = '#16a34a';
        btn.style.borderColor = '#16a34a';
        setTimeout(() => {
          btn.textContent = orig;
          btn.style.color = '';
          btn.style.borderColor = '';
        }, 2500);
      }, 900);
    });
  });
});

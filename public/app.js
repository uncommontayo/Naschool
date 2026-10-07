import { validateSignupFields } from './form-validation.js';
import { submitWaitlistSignup } from './supabase-signup.js';

const navToggle = document.querySelector('.nav__toggle');
const navLinks = document.querySelector('.nav__links');

navToggle?.addEventListener('click', () => {
  const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  navLinks?.classList.toggle('is-open', !isOpen);
});

navLinks?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', 'Open navigation');
    navLinks.classList.remove('is-open');
  });
});

const bellButton = document.querySelector('.bell-button');
bellButton?.addEventListener('click', () => {
  if (bellButton.classList.contains('is-ringing')) return;
  bellButton.classList.add('is-ringing');
  bellButton.setAttribute('aria-pressed', 'true');
  bellButton.setAttribute('aria-label', 'School bell ringing');
  window.setTimeout(() => {
    bellButton.classList.remove('is-ringing');
    bellButton.setAttribute('aria-pressed', 'false');
    bellButton.setAttribute('aria-label', 'Ring the school bell');
  }, 1700);
});

const memoryQuote = document.querySelector('#memory-quote');
document.querySelectorAll('.memory-note').forEach((note) => {
  note.addEventListener('click', () => {
    document.querySelectorAll('.memory-note').forEach((other) => other.setAttribute('aria-pressed', String(other === note)));
    if (memoryQuote) memoryQuote.textContent = `“${note.dataset.memory}”`;
  });
});

const discoveries = [
  {
    question: 'Which Nigerian state has the largest land area?',
    answer: 'Niger State. Now go find it on the map. ↗',
  },
  {
    question: 'Who was Nigeria’s first indigenous university graduate?',
    answer: 'A whole name from Nigeria’s story. You’ll find the trail in the school library. ↗',
  },
  {
    question: 'Why do some Nigerian schools use house systems?',
    answer: 'Your house turns school into your team. Find your colour. ↗',
  },
];
let discoveryIndex = 0;
const discoveryCard = document.querySelector('#discovery-card');
const discoveryQuestion = document.querySelector('#discovery-question');
const discoveryAnswer = document.querySelector('#discovery-answer');
const discoveryReveal = document.querySelector('#discovery-reveal');

function showDiscovery(nextIndex) {
  if (!discoveryCard) return;
  discoveryIndex = (nextIndex + discoveries.length) % discoveries.length;
  discoveryCard.classList.add('is-shuffling');
  window.setTimeout(() => {
    const discovery = discoveries[discoveryIndex];
    if (discoveryQuestion) discoveryQuestion.textContent = discovery.question;
    if (discoveryAnswer) {
      discoveryAnswer.textContent = discovery.answer;
      discoveryAnswer.hidden = true;
    }
    if (discoveryReveal) {
      discoveryReveal.hidden = false;
      discoveryReveal.setAttribute('aria-expanded', 'false');
      discoveryReveal.innerHTML = 'PEEK AT THE ANSWER <span aria-hidden="true">↗</span>';
    }
    const number = String(discoveryIndex + 1).padStart(2, '0');
    const numberNode = document.querySelector('#discovery-number');
    const countNode = document.querySelector('#discovery-count');
    if (numberNode) numberNode.textContent = number;
    if (countNode) countNode.textContent = `${number} / 03`;
    discoveryCard.classList.remove('is-shuffling');
  }, 110);
}

document.querySelector('#discovery-prev')?.addEventListener('click', () => showDiscovery(discoveryIndex - 1));
document.querySelector('#discovery-next')?.addEventListener('click', () => showDiscovery(discoveryIndex + 1));
discoveryReveal?.addEventListener('click', () => {
  const open = discoveryReveal.getAttribute('aria-expanded') === 'true';
  discoveryReveal.setAttribute('aria-expanded', String(!open));
  if (discoveryAnswer) discoveryAnswer.hidden = open;
  discoveryReveal.innerHTML = open ? 'PEEK AT THE ANSWER <span aria-hidden="true">↗</span>' : 'HIDE THE CLUE <span aria-hidden="true">↙</span>';
});

const timelineButtons = [...document.querySelectorAll('.timeline-stop')];
const timelineEvent = document.querySelector('#timeline-event');
const dayLive = document.querySelector('#day-live');
timelineButtons.forEach((stop) => {
  stop.addEventListener('click', () => {
    timelineButtons.forEach((other) => {
      const active = other === stop;
      other.classList.toggle('is-active', active);
      other.setAttribute('aria-pressed', String(active));
    });
    if (timelineEvent) timelineEvent.textContent = stop.dataset.event ?? '';
    if (dayLive) dayLive.textContent = `NOW ON CAMPUS: ${stop.dataset.time} / ${stop.querySelector('strong')?.textContent ?? ''}`;
  });
});

const form = document.querySelector('#signup-form');
const formStatus = document.querySelector('#form-status');
const formError = document.querySelector('#form-error');
const signupSuccess = document.querySelector('#signup-success');
const studentNumber = document.querySelector('#student-number');
const studentNumberBox = document.querySelector('.student-number');
const successMessage = document.querySelector('#success-message');
const submitButton = form?.querySelector('button[type="submit"]');
let signupInProgress = false;
const fieldErrors = {
  first_name: document.querySelector('#first-name-error'),
  last_name: document.querySelector('#last-name-error'),
  gender: document.querySelector('#gender-error'),
  email: document.querySelector('#email-error'),
};

function clearFieldErrors() {
  form?.querySelectorAll('[aria-invalid="true"]').forEach((input) => input.removeAttribute('aria-invalid'));
  Object.values(fieldErrors).forEach((error) => { if (error) error.textContent = ''; });
  if (formError) {
    formError.hidden = true;
    formError.textContent = '';
  }
}

function setFieldError(name, message) {
  const input = name === 'gender'
    ? form?.querySelector('input[name="gender"]')
    : form?.elements.namedItem(name);
  input?.setAttribute('aria-invalid', 'true');
  const error = fieldErrors[name];
  if (error) error.textContent = message;
}

form?.addEventListener('input', (event) => {
  const name = event.target?.name;
  if (name && fieldErrors[name]) {
    event.target.removeAttribute('aria-invalid');
    fieldErrors[name].textContent = '';
  }
  if (formError && !formError.hidden) {
    formError.hidden = true;
    formError.textContent = '';
  }
});

form?.addEventListener('change', (event) => {
  if (event.target?.name === 'gender') {
    form.querySelectorAll('input[name="gender"]').forEach((input) => input.removeAttribute('aria-invalid'));
    if (fieldErrors.gender) fieldErrors.gender.textContent = '';
  }
});

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (signupInProgress) return;
  clearFieldErrors();
  if (formStatus) formStatus.textContent = '';
  const { values, errors, valid } = validateSignupFields(new FormData(form));
  Object.entries(errors).forEach(([field, message]) => setFieldError(field, message));
  if (!valid) {
    form.querySelector('[aria-invalid="true"]')?.focus();
    if (formStatus) formStatus.textContent = 'Check the marked bits and try again.';
    return;
  }

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.querySelector('span:first-child').textContent = 'CHECKING THE REGISTER…';
  }
  signupInProgress = true;
  if (formStatus) formStatus.textContent = 'Asking the office to check the register…';

  try {
    const result = await submitWaitlistSignup(values, {
      logError: (details) => {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          console.error('Na School signup request failed', details);
        }
      },
    });
    if (result.status === 'duplicate' || result.status === 'success') {
      if (studentNumberBox) studentNumberBox.hidden = false;
      if (studentNumber) studentNumber.textContent = makePreviewStudentNumber();
      form.hidden = true;
      if (formStatus) formStatus.textContent = '';
      if (signupSuccess) {
        signupSuccess.hidden = false;
        signupSuccess.focus();
      }
      return;
    }
    const messages = {
      not_configured: 'The school register isn’t connected yet. Your details weren’t saved. Try again later.',
      config_error: 'The school register is unavailable. Your details weren’t saved. Please try again later.',
      network_error: 'The office cannot reach the register right now. Your details weren’t saved. Check your connection and try again.',
      supabase_error: 'The school register couldn’t save your name just now. Your details weren’t saved. Try again in a little while.',
    };
    throw new Error(messages[result.status] || messages.supabase_error);
  } catch (error) {
    if (formError) {
      formError.textContent = error.message || 'Something went wrong. Your details weren’t saved. Please try again.';
      formError.hidden = false;
    }
    if (formStatus) formStatus.textContent = '';
  } finally {
    signupInProgress = false;
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.querySelector('span:first-child').textContent = 'MAKE I JOIN';
    }
  }
});

function makePreviewStudentNumber() {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const random = new Uint8Array(6);
  window.crypto.getRandomValues(random);
  return `NS-${Array.from(random, (value) => alphabet[value % alphabet.length]).join('')}`;
}

document.querySelector('#back-to-school')?.addEventListener('click', () => {
  document.querySelector('#join-title')?.focus({ preventScroll: true });
});

document.querySelector('#share-button')?.addEventListener('click', async () => {
  const shareStatus = document.querySelector('#share-status');
  const shareData = { title: 'Na School! 🇳🇬', text: 'OMO! I don join Na School! School go soon start. No come late o.', url: window.location.origin };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
      if (shareStatus) shareStatus.textContent = 'The gist has left the compound. ✳';
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      if (shareStatus) shareStatus.textContent = 'Copied. Send the gist to your people. ✳';
    } else if (shareStatus) {
      shareStatus.textContent = shareData.url;
    }
  } catch (error) {
    if (error?.name !== 'AbortError' && shareStatus) shareStatus.textContent = 'Couldn’t share just now. Copy naschool.app and tell your people.';
  }
});

const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());

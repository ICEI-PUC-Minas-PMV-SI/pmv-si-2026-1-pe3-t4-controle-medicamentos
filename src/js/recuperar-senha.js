document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('recover-form');
    const inputEmail = document.getElementById('email');
    const btnSubmit = document.getElementById('btn-submit');
    const emailError = document.getElementById('email-error');

    const formContainer = document.getElementById('form-container');
    const successContainer = document.getElementById('success-container');
    const successEmailSpan = document.getElementById('success-email');

    inputEmail.addEventListener('input', () => {
        inputEmail.classList.remove('error');
        emailError.classList.remove('visible');
        emailError.textContent = '';
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = inputEmail.value.trim();

        if (!email) {
            showError('Por favor, informe seu e-mail de cadastro.');
            return;
        }
        if (!email.includes('@') || !email.includes('.')) {
            showError('Formato de e-mail inválido.');
            return;
        }


        btnSubmit.classList.add('loading');

        setTimeout(() => {
            btnSubmit.classList.remove('loading');


            showSuccess(email);
        }, 1500); // 1.5s delay
    });

    function showError(message) {
        inputEmail.classList.add('error');
        emailError.textContent = message;
        emailError.classList.add('visible');
    }

    function showSuccess(email) {

        formContainer.style.display = 'none';

        successEmailSpan.textContent = email;
        successContainer.style.display = 'flex';
    }
});

// js/storybook.js
document.addEventListener('DOMContentLoaded', () => {
    // Atualiza os seletores para encontrar os slides e botões dentro da classe .hero
    const slides = document.querySelectorAll('.hero .slide');
    const dots = document.querySelectorAll('.hero .nav-dot');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        // Se não encontrar slides, para a execução para evitar erros.
        if (slides.length === 0) return;
        
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        currentSlide = index;
    }

    function nextSlide() {
        const newIndex = (currentSlide + 1) % slides.length;
        showSlide(newIndex);
    }

    function startSlideShow() {
        // Muda de slide a cada 5 segundos
        stopSlideShow(); // Limpa qualquer intervalo anterior para segurança
        slideInterval = setInterval(nextSlide, 5000);
    }

    function stopSlideShow() {
        clearInterval(slideInterval);
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            // Reinicia o slideshow para que ele continue rodando após a interação
            startSlideShow();
        });
    });

    // Inicia o slideshow se houver slides
    if (slides.length > 0) {
        startSlideShow();
    }
});

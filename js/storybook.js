// js/storybook.js
document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.storybook .slide');
    const dots = document.querySelectorAll('.storybook .nav-dot');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
            dots[i].classList.toggle('active', i === index);
        });
        currentSlide = index;
    }

    function nextSlide() {
        const newIndex = (currentSlide + 1) % slides.length;
        showSlide(newIndex);
    }

    function startSlideShow() {
        // Muda de slide a cada 5 segundos
        slideInterval = setInterval(nextSlide, 5000);
    }

    function stopSlideShow() {
        clearInterval(slideInterval);
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            stopSlideShow(); // Para o automático quando o usuário interage
        });
    });

    startSlideShow();
});
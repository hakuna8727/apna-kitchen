// js/slideshow.js

document.addEventListener("DOMContentLoaded", function() {
    let slideIndex = 0;
    showSlides();

    function showSlides() {
        let slides = document.getElementsByClassName("hero-slide");
        
        // Hide all slides
        for (let i = 0; i < slides.length; i++) {
            slides[i].classList.remove("active");
        }
        
        // Increment slide index, or reset if at the end
        slideIndex++;
        if (slideIndex > slides.length) {
            slideIndex = 1;
        }
        
        // Show the current slide
        slides[slideIndex - 1].classList.add("active");
        
        // Change image every 5 seconds (5000 milliseconds)
        setTimeout(showSlides, 5000); 
    }
});
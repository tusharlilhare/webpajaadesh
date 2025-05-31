    // Toggle menu for mobile
    const toggle = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");

    toggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });

    // Carousel Logic
    let current = 0;
    const slides = document.getElementById("slide-container");
    const dots = document.querySelectorAll(".dot");

    function changeSlide(index) {
      current = index;
      slides.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot) => dot.classList.remove("active"));
      dots[index].classList.add("active");
    }

    // Auto slide every 5 seconds
    setInterval(() => {
      current = (current + 1) % dots.length;
      changeSlide(current);
    }, 5000);
// Wait for the DOM to be fully loaded and parsed
// 'defer' attribute in script tag handles this, but wrapping can be extra safe practice
// document.addEventListener('DOMContentLoaded', () => { // Not strictly needed with 'defer'

  // ============ Mobile Menu Toggle ============
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.getElementById('navMenu');

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isExpanded = navMenu.classList.toggle('active');
      mobileMenuBtn.setAttribute('aria-expanded', isExpanded); // Update ARIA state
       // Change button text/icon (Optional)
       if (isExpanded) {
          mobileMenuBtn.textContent = '✕'; // Close icon
       } else {
           mobileMenuBtn.textContent = '☰'; // Hamburger icon
       }
    });

    // Close menu when a link is clicked
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('active')) {
             navMenu.classList.remove('active');
             mobileMenuBtn.setAttribute('aria-expanded', 'false');
             mobileMenuBtn.textContent = '☰'; // Reset icon
        }
      });
    });
  }


  // ============ Back to Top Button ============
  const backToTopBtn = document.getElementById('backToTop');

  if (backToTopBtn) {
    const scrollThreshold = 300; // Pixels scrolled before button appears

    window.addEventListener('scroll', () => {
      if (window.pageYOffset > scrollThreshold) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });

    // Smooth scroll to top
    backToTopBtn.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }


  // ============ Scroll Reveal Intersection Observer ============
  const revealSections = document.querySelectorAll('section:not(.hero)'); // Exclude hero
  const dateLocation = document.getElementById('dateLocation');

  if (revealSections.length > 0) {
    const sectionObserverOptions = {
      threshold: 0.1, // Trigger when 10% of the section is visible
      // rootMargin: "0px 0px -50px 0px" // Optional: trigger slightly before it enters viewport
    };

    const revealOnScroll = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
          observer.unobserve(entry.target); // Stop observing once revealed
        }
      });
    };

    const sectionObserver = new IntersectionObserver(revealOnScroll, sectionObserverOptions);

    revealSections.forEach(section => {
      sectionObserver.observe(section);
    });
  }

  // Animate the Date/Location element in the hero section on load
  if (dateLocation) {
      // Use a small timeout to ensure transition is applied after initial render
      setTimeout(() => {
          dateLocation.style.opacity = 1;
          dateLocation.style.transform = 'translateY(0)';
      }, 100); // 100ms delay
  }


 // ============ PARTICLE NETWORK w/ MOUSE REACTIVITY ============
const canvas = document.getElementById('particlesCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationFrameId;

  // Particle settings (adjust as needed)
  const particleSettings = {
    numParticles: 60,
    maxVelocity: 0.5,
    connectDist: 160,
    particleRadius: 3,
    maxLineAlpha: 0.6,
    repelRadius: 120,
    repelStrength: 0.1, // Reduced slightly
    particleColor: 'rgba(255, 255, 255, 0.7)', // Slightly more transparent
    lineColor: 'rgba(255, 255, 255, $alpha)', // Template for line color
  };

  let mouse = { x: undefined, y: undefined, isActive: false };

  const handleMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.isActive = true;
  };

  const handleMouseLeave = () => {
    mouse.isActive = false;
  };

  const handleTouchMove = (e) => {
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left;
      mouse.y = e.touches[0].clientY - rect.top;
      mouse.isActive = true;
    }
  };

  const handleTouchEnd = () => {
    mouse.isActive = false;
  };

  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseleave', handleMouseLeave);
  canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
  canvas.addEventListener('touchend', handleTouchEnd);
  canvas.addEventListener('touchcancel', handleTouchEnd);

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * particleSettings.maxVelocity * 2;
      this.vy = (Math.random() - 0.5) * particleSettings.maxVelocity * 2;
      this.baseVx = this.vx; // Store base velocity for return
      this.baseVy = this.vy;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, particleSettings.particleRadius, 0, Math.PI * 2);
      ctx.fillStyle = particleSettings.particleColor;
      ctx.fill();
    }

    update() {
      let appliedRepel = false;
      // Mouse interaction (repel)
      if (mouse.isActive && mouse.x !== undefined && mouse.y !== undefined) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < particleSettings.repelRadius) {
          appliedRepel = true;
          const forceDirectionX = dx / dist;
          const forceDirectionY = dy / dist;
          // Make repel stronger closer to the mouse
          const force = (particleSettings.repelRadius - dist) / particleSettings.repelRadius;
          const directionX = forceDirectionX * force * particleSettings.repelStrength;
          const directionY = forceDirectionY * force * particleSettings.repelStrength;

          this.vx += directionX;
          this.vy += directionY;

          // Limit velocity increase due to repel
          const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
          const maxSpeed = particleSettings.maxVelocity * 3; // Allow faster repel speed
          if (currentSpeed > maxSpeed) {
            this.vx = (this.vx / currentSpeed) * maxSpeed;
            this.vy = (this.vy / currentSpeed) * maxSpeed;
          }
        }
      }

      // If not repelled, gradually return to base velocity (dampening)
      if (!appliedRepel) {
        this.vx += (this.baseVx - this.vx) * 0.05; // Dampening factor
        this.vy += (this.baseVy - this.vy) * 0.05;
      }

      // Move particle
      this.x += this.vx;
      this.y += this.vy;

      // Boundary collision (bounce) using particle radius
      if (this.x < particleSettings.particleRadius) {
        this.vx *= -1;
        this.x = particleSettings.particleRadius;
      } else if (this.x > canvas.width - particleSettings.particleRadius) {
        this.vx *= -1;
        this.x = canvas.width - particleSettings.particleRadius;
      }

      if (this.y < particleSettings.particleRadius) {
        this.vy *= -1;
        this.y = particleSettings.particleRadius;
      } else if (this.y > canvas.height - particleSettings.particleRadius) {
        this.vy *= -1;
        this.y = canvas.height - particleSettings.particleRadius;
      }
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < particleSettings.numParticles; i++) {
      particles.push(new Particle());
    }
  }

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < particleSettings.connectDist) {
          let alpha = (1 - dist / particleSettings.connectDist) * particleSettings.maxLineAlpha;
          alpha = Math.max(0, Math.min(alpha, 1)); // Clamp alpha between 0 and 1

          ctx.beginPath();
          // Use template string for color alpha
          ctx.strokeStyle = particleSettings.lineColor.replace('$alpha', alpha.toFixed(3));
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    connectParticles();

    animationFrameId = requestAnimationFrame(animate);
  }

  // Initial setup
  resizeCanvas();
  initParticles();
  animate(); // Start animation

  // Debounced resize handler
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
      resizeCanvas();
      initParticles(); // Re-init particles for new size
      animate(); // Restart animation
    }, 250);
  });
}


  // ============ IMAGE COMPARISON SLIDER ============
  const comparisonContainers = document.querySelectorAll(".comparison-container");

  comparisonContainers.forEach(container => {
    const slider = container.querySelector(".comparison-slider");
    const overlayImage = container.querySelector(".comparison-overlay .overlay-image");

    if (!slider || !overlayImage) return; // Skip if elements are missing

    let isDragging = false;
    let sliderPosition = 0.5; // Start at 50%

    function updateClip(position) {
      sliderPosition = Math.max(0, Math.min(position, 1)); // Clamp between 0 and 1
      const rightInset = 100 - sliderPosition * 100;
      overlayImage.style.clipPath = `inset(0 ${rightInset}% 0 0)`;
      slider.style.left = `${sliderPosition * 100}%`;
    }

    function moveSlider(clientX) {
      const rect = container.getBoundingClientRect();
      const offsetX = clientX - rect.left;
      const newPosition = offsetX / rect.width;
      updateClip(newPosition);
    }

    // Mouse events
    container.addEventListener("mousedown", (e) => {
       // Only start drag if clicking near the slider line or handle for better UX
       const sliderRect = slider.getBoundingClientRect();
       const handleRadius = 15; // Roughly half the visual handle size
       if (Math.abs(e.clientX - sliderRect.left - sliderRect.width / 2) < handleRadius) {
           isDragging = true;
           container.style.cursor = 'ew-resize'; // Change cursor during drag
           e.preventDefault(); // Prevent text selection
       }
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      moveSlider(e.clientX);
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
           isDragging = false;
           container.style.cursor = 'ew-resize'; // Reset cursor
      }
    });

    // Touch events
    container.addEventListener("touchstart", (e) => {
       const touch = e.touches[0];
       const sliderRect = slider.getBoundingClientRect();
       const handleRadius = 25; // Larger touch target
       if (Math.abs(touch.clientX - sliderRect.left - sliderRect.width / 2) < handleRadius) {
           isDragging = true;
           container.style.cursor = 'ew-resize';
           // e.preventDefault(); // Might prevent scrolling on touch devices, use passive?
       }
    }, { passive: true }); // Use passive listener for touchstart

    document.addEventListener("touchmove", (e) => {
      if (!isDragging || !e.touches[0]) return;
      const touch = e.touches[0];
      moveSlider(touch.clientX);
      e.preventDefault(); // Prevent scrolling WHILE dragging the slider
    }, { passive: false }); // Need passive: false to prevent scroll during drag

    document.addEventListener("touchend", () => {
      if (isDragging) {
        isDragging = false;
        container.style.cursor = 'ew-resize';
      }
    });

    // Initial setup
    updateClip(sliderPosition);
  });


// }); // End of DOMContentLoaded wrapper (if used)

import { z } from "zod";

// Schema for the individual testimonial
const testimonialSchema = z.object({
    name: z.string(),
    role: z.string().optional(),
    content: z.string(),
    avatar: z.string().optional(),
});

export type Testimonial = z.infer<typeof testimonialSchema>;

// Schema for the block configuration
export const testimonialCarouselConfigSchema = z.object({
    title: z.string().default("What Our Clients Say"),
    autoplay: z.boolean().default(true),
    interval: z.number().default(5000),
    showIndicators: z.boolean().default(true),
    showArrows: z.boolean().default(true),
    testimonials: z
        .array(testimonialSchema)
        .min(1)
        .default([
            {
                name: "Alex Johnson",
                role: "CEO, TechCorp",
                content:
                    "Working with this team has been an incredible experience. They delivered beyond our expectations.",
                avatar: "https://i.pravatar.cc/150?img=1",
            },
            {
                name: "Sarah Williams",
                role: "Marketing Director",
                content:
                    "Exceptional service and attention to detail. I highly recommend their services to anyone looking for quality.",
                avatar: "https://i.pravatar.cc/150?img=5",
            },
            {
                name: "Michael Chen",
                role: "Product Manager",
                content:
                    "Their innovative approach and technical expertise helped us solve complex problems efficiently.",
                avatar: "https://i.pravatar.cc/150?img=8",
            },
        ]),
});

export type TestimonialCarouselConfig = z.infer<
    typeof testimonialCarouselConfigSchema
>;

// Default configuration
export const defaultTestimonialCarouselConfig: TestimonialCarouselConfig = {
    title: "What Our Clients Say",
    autoplay: true,
    interval: 5000,
    showIndicators: true,
    showArrows: true,
    testimonials: [
        {
            name: "Alex Johnson",
            role: "CEO, TechCorp",
            content:
                "Working with this team has been an incredible experience. They delivered beyond our expectations.",
            avatar: "https://i.pravatar.cc/150?img=1",
        },
        {
            name: "Sarah Williams",
            role: "Marketing Director",
            content:
                "Exceptional service and attention to detail. I highly recommend their services to anyone looking for quality.",
            avatar: "https://i.pravatar.cc/150?img=5",
        },
        {
            name: "Michael Chen",
            role: "Product Manager",
            content:
                "Their innovative approach and technical expertise helped us solve complex problems efficiently.",
            avatar: "https://i.pravatar.cc/150?img=8",
        },
    ],
};

// HTML template for the testimonial carousel block
export const generateTestimonialCarouselHTML = (
    config: TestimonialCarouselConfig,
): string => {
    // Generate testimonial slides
    const testimonialSlides = config.testimonials
        .map((testimonial, index) => {
            const avatar = testimonial.avatar
                ? `<img src="${testimonial.avatar}" alt="${testimonial.name}" class="testimonial-avatar" />`
                : `<div class="testimonial-avatar-placeholder">${testimonial.name.charAt(0)}</div>`;

            return `
      <div class="testimonial-slide${index === 0 ? " active" : ""}" data-index="${index}">
        <div class="testimonial-content">
          <blockquote>"${testimonial.content}"</blockquote>
        </div>
        <div class="testimonial-author">
          ${avatar}
          <div class="testimonial-author-info">
            <div class="testimonial-author-name">${testimonial.name}</div>
            ${testimonial.role ? `<div class="testimonial-author-role">${testimonial.role}</div>` : ""}
          </div>
        </div>
      </div>
    `;
        })
        .join("");

    // Generate carousel indicators
    const indicators = config.showIndicators
        ? `
      <div class="testimonial-indicators">
        ${config.testimonials
            .map(
                (_, index) =>
                    `<button class="testimonial-indicator${index === 0 ? " active" : ""}" data-index="${index}"></button>`,
            )
            .join("")}
      </div>
    `
        : "";

    // Generate carousel arrows
    const arrows = config.showArrows
        ? `
      <button class="testimonial-arrow testimonial-prev" aria-label="Previous testimonial">&lt;</button>
      <button class="testimonial-arrow testimonial-next" aria-label="Next testimonial">&gt;</button>
    `
        : "";

    return `
    <div class="testimonial-carousel" style="
      --block-primary: oklch(65% var(--feno-color-chroma) var(--feno-color-hue));
      --block-primary-hover: oklch(60% var(--feno-color-chroma) var(--feno-color-hue));
      --block-text: oklch(98% 0 0);
      --block-text-muted: oklch(80% 0 0);
      --block-background: oklch(25% 0 0);
      --block-border: oklch(40% 0 0);
    " data-autoplay="${config.autoplay}" data-interval="${config.interval}">
      <h2 class="testimonial-title">${config.title}</h2>

      <div class="testimonial-container">
        <div class="testimonial-slides">
          ${testimonialSlides}
        </div>

        ${arrows}
        ${indicators}
      </div>
    </div>

    <style>
      .testimonial-carousel {
        background-color: var(--block-background);
        color: var(--block-text);
        border-radius: 8px;
        padding: 2rem;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        max-width: 800px;
        margin: 2rem auto;
        position: relative;
        border: 1px solid var(--block-border);
      }

      .testimonial-title {
        font-size: 1.75rem;
        text-align: center;
        margin-bottom: 2rem;
        font-weight: 600;
      }

      .testimonial-container {
        position: relative;
        overflow: hidden;
      }

      .testimonial-slides {
        display: flex;
        min-height: 200px;
      }

      .testimonial-slide {
        flex: 0 0 100%;
        opacity: 0;
        transition: opacity 0.5s ease;
        position: absolute;
        width: 100%;
        display: none;
      }

      .testimonial-slide.active {
        opacity: 1;
        position: relative;
        display: block;
      }

      .testimonial-content {
        margin-bottom: 1.5rem;
      }

      .testimonial-content blockquote {
        font-size: 1.125rem;
        line-height: 1.6;
        font-style: italic;
        margin: 0;
      }

      .testimonial-author {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .testimonial-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--block-primary);
      }

      .testimonial-avatar-placeholder {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: var(--block-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: bold;
      }

      .testimonial-author-info {
        display: flex;
        flex-direction: column;
      }

      .testimonial-author-name {
        font-weight: 600;
      }

      .testimonial-author-role {
        font-size: 0.875rem;
        color: var(--block-text-muted);
      }

      .testimonial-indicators {
        display: flex;
        justify-content: center;
        gap: 0.5rem;
        margin-top: 1.5rem;
      }

      .testimonial-indicator {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: none;
        background-color: var(--block-border);
        cursor: pointer;
        padding: 0;
        transition: background-color 0.3s ease;
      }

      .testimonial-indicator.active {
        background-color: var(--block-primary);
      }

      .testimonial-arrow {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background-color: rgba(0, 0, 0, 0.3);
        color: var(--block-text);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        cursor: pointer;
        transition: background-color 0.3s ease;
        z-index: 2;
      }

      .testimonial-arrow:hover {
        background-color: var(--block-primary);
      }

      .testimonial-prev {
        left: 10px;
      }

      .testimonial-next {
        right: 10px;
      }
    </style>

    <script>
      (function() {
        const carousel = document.querySelector('.testimonial-carousel');
        if (!carousel) return;

        const slides = carousel.querySelectorAll('.testimonial-slide');
        const indicators = carousel.querySelectorAll('.testimonial-indicator');
        const prevBtn = carousel.querySelector('.testimonial-prev');
        const nextBtn = carousel.querySelector('.testimonial-next');

        let currentIndex = 0;
        let autoplayInterval;

        // Initialize autoplay if enabled
        const autoplay = carousel.getAttribute('data-autoplay') === 'true';
        const interval = parseInt(carousel.getAttribute('data-interval') || '5000', 10);

        function showSlide(index) {
          // Hide all slides
          slides.forEach(slide => {
            slide.classList.remove('active');
          });

          // Update indicators if they exist
          if (indicators.length > 0) {
            indicators.forEach(indicator => {
              indicator.classList.remove('active');
            });
            indicators[index].classList.add('active');
          }

          // Show current slide
          slides[index].classList.add('active');
          currentIndex = index;
        }

        function nextSlide() {
          const newIndex = (currentIndex + 1) % slides.length;
          showSlide(newIndex);
        }

        function prevSlide() {
          const newIndex = (currentIndex - 1 + slides.length) % slides.length;
          showSlide(newIndex);
        }

        // Set up indicators click events
        indicators.forEach(indicator => {
          indicator.addEventListener('click', () => {
            const index = parseInt(indicator.getAttribute('data-index') || '0', 10);
            showSlide(index);
            resetAutoplay();
          });
        });

        // Set up arrow click events
        if (prevBtn) {
          prevBtn.addEventListener('click', () => {
            prevSlide();
            resetAutoplay();
          });
        }

        if (nextBtn) {
          nextBtn.addEventListener('click', () => {
            nextSlide();
            resetAutoplay();
          });
        }

        // Function to start autoplay
        function startAutoplay() {
          if (autoplay && slides.length > 1) {
            autoplayInterval = setInterval(() => {
              nextSlide();
            }, interval);
          }
        }

        // Function to reset autoplay
        function resetAutoplay() {
          if (autoplayInterval) {
            clearInterval(autoplayInterval);
            startAutoplay();
          }
        }

        // Initialize the carousel
        showSlide(0);
        startAutoplay();

        // Add touch support for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        carousel.addEventListener('touchstart', e => {
          touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        carousel.addEventListener('touchend', e => {
          touchEndX = e.changedTouches[0].screenX;
          handleSwipe();
        }, { passive: true });

        function handleSwipe() {
          if (touchEndX < touchStartX - 50) {
            // Swipe left, go to next slide
            nextSlide();
            resetAutoplay();
          } else if (touchEndX > touchStartX + 50) {
            // Swipe right, go to previous slide
            prevSlide();
            resetAutoplay();
          }
        }
      })();
    </script>
  `;
};

// Metadata for the block
export const testimonialCarouselBlockInfo = {
    id: "testimonial-carousel",
    name: "Testimonial Carousel",
    description: "Add a testimonial carousel to showcase client feedback",
    icon: "quote", // This will be mapped to an icon from the icon library
    tags: ["marketing", "social proof", "testimonial"],
    generateHTML: generateTestimonialCarouselHTML,
    defaultConfig: defaultTestimonialCarouselConfig,
    configSchema: testimonialCarouselConfigSchema,
};

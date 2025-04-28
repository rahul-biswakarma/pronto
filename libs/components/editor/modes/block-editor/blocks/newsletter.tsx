import { z } from "zod";

// Schema for the block configuration
export const newsletterConfigSchema = z.object({
    title: z.string().default("Join Our Newsletter"),
    description: z.string().default("Get the latest updates from our team"),
    buttonText: z.string().default("Subscribe"),
    apiEndpoint: z.string().default("/api/subscribe"),
    showNameField: z.boolean().default(true),
});

export type NewsletterConfig = z.infer<typeof newsletterConfigSchema>;

// Default configuration
export const defaultNewsletterConfig: NewsletterConfig = {
    title: "Join Our Newsletter",
    description: "Get the latest updates from our team",
    buttonText: "Subscribe",
    apiEndpoint: "/api/subscribe",
    showNameField: true,
};

// HTML template for the newsletter block
export const generateNewsletterHTML = (config: NewsletterConfig): string => {
    const nameField = config.showNameField
        ? `
      <div class="newsletter-field-container">
        <label for="newsletter-name" class="newsletter-label">Name</label>
        <input type="text" id="newsletter-name" name="name" class="newsletter-input" placeholder="Your name" />
      </div>
    `
        : "";

    return `
    <div class="newsletter-block" style="
      --block-primary: oklch(65% var(--feno-color-chroma) var(--feno-color-hue));
      --block-primary-hover: oklch(60% var(--feno-color-chroma) var(--feno-color-hue));
      --block-text: oklch(98% 0 0);
      --block-background: oklch(25% 0 0);
      --block-border: oklch(40% 0 0);
    ">
      <div class="newsletter-content">
        <h3 class="newsletter-title">${config.title}</h3>
        <p class="newsletter-description">${config.description}</p>
        <form class="newsletter-form" data-api-endpoint="${config.apiEndpoint}">
          ${nameField}
          <div class="newsletter-field-container">
            <label for="newsletter-email" class="newsletter-label">Email</label>
            <input type="email" id="newsletter-email" name="email" class="newsletter-input" placeholder="Your email address" required />
          </div>
          <button type="submit" class="newsletter-button">${config.buttonText}</button>
        </form>
        <div class="newsletter-message" style="display: none;"></div>
      </div>
    </div>

    <style>
      .newsletter-block {
        background-color: var(--block-background);
        color: var(--block-text);
        border-radius: 8px;
        padding: 2rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-width: 500px;
        margin: 2rem auto;
        border: 1px solid var(--block-border);
      }

      .newsletter-title {
        font-size: 1.5rem;
        margin-bottom: 0.75rem;
        font-weight: 600;
      }

      .newsletter-description {
        margin-bottom: 1.5rem;
        opacity: 0.9;
      }

      .newsletter-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .newsletter-field-container {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .newsletter-input {
        padding: 0.75rem;
        border-radius: 4px;
        border: 1px solid var(--block-border);
        background-color: rgba(255, 255, 255, 0.05);
        color: var(--block-text);
      }

      .newsletter-button {
        background-color: var(--block-primary);
        color: var(--block-text);
        border: none;
        border-radius: 4px;
        padding: 0.75rem;
        font-weight: 500;
        cursor: pointer;
        margin-top: 0.5rem;
        transition: background-color 0.2s ease;
      }

      .newsletter-button:hover {
        background-color: var(--block-primary-hover);
      }

      .newsletter-message {
        margin-top: 1rem;
        font-weight: 500;
      }

      .newsletter-message.success {
        color: #48BB78;
      }

      .newsletter-message.error {
        color: #F56565;
      }
    </style>

    <script>
      (function() {
        const form = document.querySelector('.newsletter-form');
        const messageEl = document.querySelector('.newsletter-message');

        if (form) {
          form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get the endpoint from the data attribute
            const endpoint = form.getAttribute('data-api-endpoint') || '/api/subscribe';

            // Collect form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
              messageEl.textContent = 'Submitting...';
              messageEl.className = 'newsletter-message';
              messageEl.style.display = 'block';

              // Simple validation
              if (!data.email) {
                throw new Error('Email is required');
              }

              // Send the subscription request
              const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
              });

              if (!response.ok) {
                throw new Error('Failed to subscribe');
              }

              // Display success message
              messageEl.textContent = 'Thank you for subscribing!';
              messageEl.className = 'newsletter-message success';
              form.reset();
            } catch (error) {
              // Display error message
              messageEl.textContent = error.message || 'Something went wrong. Please try again.';
              messageEl.className = 'newsletter-message error';
            }
          });
        }
      })();
    </script>
  `;
};

// Metadata for the block
export const newsletterBlockInfo = {
    id: "newsletter",
    name: "Newsletter",
    description: "Add a newsletter subscription form to your website",
    icon: "mail", // This will be mapped to an icon from the icon library
    tags: ["marketing", "subscription", "communication"],
    generateHTML: generateNewsletterHTML,
    defaultConfig: defaultNewsletterConfig,
    configSchema: newsletterConfigSchema,
};

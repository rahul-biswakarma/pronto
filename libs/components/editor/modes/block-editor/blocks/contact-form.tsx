import { z } from "zod";

// Schema for the block configuration
export const contactFormConfigSchema = z.object({
    title: z.string().default("Contact Us"),
    description: z
        .string()
        .default("Got questions? We'd love to hear from you."),
    buttonText: z.string().default("Send Message"),
    apiEndpoint: z.string().default("/api/contact"),
    includePhone: z.boolean().default(true),
    includeMessage: z.boolean().default(true),
    includeSubject: z.boolean().default(false),
});

export type ContactFormConfig = z.infer<typeof contactFormConfigSchema>;

// Default configuration
export const defaultContactFormConfig: ContactFormConfig = {
    title: "Contact Us",
    description: "Got questions? We'd love to hear from you.",
    buttonText: "Send Message",
    apiEndpoint: "/api/contact",
    includePhone: true,
    includeMessage: true,
    includeSubject: false,
};

// HTML template for the contact form block
export const generateContactFormHTML = (config: ContactFormConfig): string => {
    const phoneField = config.includePhone
        ? `
      <div class="contact-field-container">
        <label for="contact-phone" class="contact-label">Phone</label>
        <input type="tel" id="contact-phone" name="phone" class="contact-input" placeholder="Your phone number" />
      </div>
    `
        : "";

    const subjectField = config.includeSubject
        ? `
      <div class="contact-field-container">
        <label for="contact-subject" class="contact-label">Subject</label>
        <input type="text" id="contact-subject" name="subject" class="contact-input" placeholder="Subject" />
      </div>
    `
        : "";

    const messageField = config.includeMessage
        ? `
      <div class="contact-field-container">
        <label for="contact-message" class="contact-label">Message</label>
        <textarea id="contact-message" name="message" class="contact-input contact-textarea" placeholder="Your message" rows="5" required></textarea>
      </div>
    `
        : "";

    return `
    <div class="contact-form-block" style="
      --block-primary: oklch(65% var(--feno-color-chroma) var(--feno-color-hue));
      --block-primary-hover: oklch(60% var(--feno-color-chroma) var(--feno-color-hue));
      --block-text: oklch(98% 0 0);
      --block-background: oklch(25% 0 0);
      --block-border: oklch(40% 0 0);
    ">
      <div class="contact-content">
        <h3 class="contact-title">${config.title}</h3>
        <p class="contact-description">${config.description}</p>
        <form class="contact-form" data-api-endpoint="${config.apiEndpoint}">
          <div class="contact-field-container">
            <label for="contact-name" class="contact-label">Name</label>
            <input type="text" id="contact-name" name="name" class="contact-input" placeholder="Your name" required />
          </div>

          <div class="contact-field-container">
            <label for="contact-email" class="contact-label">Email</label>
            <input type="email" id="contact-email" name="email" class="contact-input" placeholder="Your email address" required />
          </div>

          ${phoneField}
          ${subjectField}
          ${messageField}

          <button type="submit" class="contact-button">${config.buttonText}</button>
        </form>
        <div class="contact-message" style="display: none;"></div>
      </div>
    </div>

    <style>
      .contact-form-block {
        background-color: var(--block-background);
        color: var(--block-text);
        border-radius: 8px;
        padding: 2rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-width: 600px;
        margin: 2rem auto;
        border: 1px solid var(--block-border);
      }

      .contact-title {
        font-size: 1.5rem;
        margin-bottom: 0.75rem;
        font-weight: 600;
      }

      .contact-description {
        margin-bottom: 1.5rem;
        opacity: 0.9;
      }

      .contact-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .contact-field-container {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .contact-input {
        padding: 0.75rem;
        border-radius: 4px;
        border: 1px solid var(--block-border);
        background-color: rgba(255, 255, 255, 0.05);
        color: var(--block-text);
        font-family: inherit;
      }

      .contact-textarea {
        resize: vertical;
        min-height: 120px;
      }

      .contact-button {
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

      .contact-button:hover {
        background-color: var(--block-primary-hover);
      }

      .contact-message {
        margin-top: 1rem;
        font-weight: 500;
      }

      .contact-message.success {
        color: #48BB78;
      }

      .contact-message.error {
        color: #F56565;
      }
    </style>

    <script>
      (function() {
        const form = document.querySelector('.contact-form');
        const messageEl = document.querySelector('.contact-message');

        if (form) {
          form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Get the endpoint from the data attribute
            const endpoint = form.getAttribute('data-api-endpoint') || '/api/contact';

            // Collect form data
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
              messageEl.textContent = 'Sending...';
              messageEl.className = 'contact-message';
              messageEl.style.display = 'block';

              // Simple validation
              if (!data.email || !data.name) {
                throw new Error('Name and email are required');
              }

              // Send the contact request
              const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
              });

              if (!response.ok) {
                throw new Error('Failed to send message');
              }

              // Display success message
              messageEl.textContent = 'Thank you for your message! We\'ll get back to you soon.';
              messageEl.className = 'contact-message success';
              form.reset();
            } catch (error) {
              // Display error message
              messageEl.textContent = error.message || 'Something went wrong. Please try again.';
              messageEl.className = 'contact-message error';
            }
          });
        }
      })();
    </script>
  `;
};

// Metadata for the block
export const contactFormBlockInfo = {
    id: "contact-form",
    name: "Contact Form",
    description: "Add a contact form to your website",
    icon: "message-circle", // This will be mapped to an icon from the icon library
    tags: ["communication", "form", "contact"],
    generateHTML: generateContactFormHTML,
    defaultConfig: defaultContactFormConfig,
    configSchema: contactFormConfigSchema,
};

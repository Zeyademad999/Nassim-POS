// utils/AutoTranslator.js
import { useEffect } from "react";
import { useLanguage } from "../../frontend/src/context/LanguageContext";

class AutoTranslator {
  constructor() {
    this.translatedElements = new Map();
    this.isTranslating = false;
  }

  translatePage(language, translations) {
    if (this.isTranslating) return;
    this.isTranslating = true;

    try {
      if (language === "en") {
        this.restoreOriginalText();
      } else if (language === "ar") {
        this.translateToArabic(translations.ar);
      }
    } finally {
      this.isTranslating = false;
    }
  }

  translateToArabic(arabicTranslations) {
    // First restore any previous translations
    this.restoreOriginalText();

    // Wait for DOM to be ready
    setTimeout(() => {
      this.translateTextContent(arabicTranslations);
      this.translateAttributes(arabicTranslations);
    }, 100);
  }

  translateTextContent(translations) {
    // Get all text nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          // Skip script, style, and empty text nodes
          if (
            !parent ||
            ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName) ||
            !node.textContent.trim()
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      textNodes.push(node);
    }

    // Translate each text node
    textNodes.forEach((textNode) => {
      const originalText = textNode.textContent.trim();
      const translation = translations[originalText];

      if (translation && originalText !== translation) {
        // Store original text
        if (!this.translatedElements.has(textNode)) {
          this.translatedElements.set(textNode, {
            type: "text",
            original: originalText,
          });
        }
        textNode.textContent = translation;
      }
    });
  }

  translateAttributes(translations) {
    // Translate placeholders
    const placeholderElements = document.querySelectorAll("[placeholder]");
    placeholderElements.forEach((element) => {
      const originalPlaceholder = element.getAttribute("placeholder");
      const translation = translations[originalPlaceholder];

      if (translation && originalPlaceholder !== translation) {
        if (!this.translatedElements.has(element)) {
          this.translatedElements.set(element, {
            type: "placeholder",
            original: originalPlaceholder,
          });
        }
        element.setAttribute("placeholder", translation);
      }
    });

    // Translate titles
    const titleElements = document.querySelectorAll("[title]");
    titleElements.forEach((element) => {
      const originalTitle = element.getAttribute("title");
      const translation = translations[originalTitle];

      if (translation && originalTitle !== translation) {
        if (!this.translatedElements.has(element)) {
          this.translatedElements.set(element, {
            type: "title",
            original: originalTitle,
          });
        }
        element.setAttribute("title", translation);
      }
    });

    // Translate aria-labels
    const ariaElements = document.querySelectorAll("[aria-label]");
    ariaElements.forEach((element) => {
      const originalAriaLabel = element.getAttribute("aria-label");
      const translation = translations[originalAriaLabel];

      if (translation && originalAriaLabel !== translation) {
        if (!this.translatedElements.has(element)) {
          this.translatedElements.set(element, {
            type: "aria-label",
            original: originalAriaLabel,
          });
        }
        element.setAttribute("aria-label", translation);
      }
    });
  }

  restoreOriginalText() {
    this.translatedElements.forEach((data, element) => {
      try {
        switch (data.type) {
          case "text":
            if (element.textContent !== data.original) {
              element.textContent = data.original;
            }
            break;
          case "placeholder":
            element.setAttribute("placeholder", data.original);
            break;
          case "title":
            element.setAttribute("title", data.original);
            break;
          case "aria-label":
            element.setAttribute("aria-label", data.original);
            break;
        }
      } catch (error) {
        console.warn("Error restoring translation:", error);
      }
    });

    this.translatedElements.clear();
  }
}

// Create singleton instance
const autoTranslator = new AutoTranslator();

// Hook to use in components
export const useAutoTranslation = () => {
  const { language, translations } = useLanguage();

  useEffect(() => {
    // Add a small delay to ensure DOM is rendered
    const timeoutId = setTimeout(() => {
      autoTranslator.translatePage(language, translations);
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [language, translations]);

  // Also translate when new content is added (for dynamic content)
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      let shouldRetranslate = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          // Check if text content was added
          mutation.addedNodes.forEach((node) => {
            if (
              node.nodeType === Node.TEXT_NODE ||
              (node.nodeType === Node.ELEMENT_NODE && node.textContent.trim())
            ) {
              shouldRetranslate = true;
            }
          });
        }
      });

      if (shouldRetranslate && language === "ar") {
        setTimeout(() => {
          autoTranslator.translatePage(language, translations);
        }, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [language, translations]);
};

export default autoTranslator;

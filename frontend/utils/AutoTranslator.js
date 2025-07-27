// utils/AutoTranslator.js
import { useEffect } from "react";
import { useLanguage } from "../../frontend/src/context/LanguageContext";

class AutoTranslator {
  constructor() {
    this.translatedElements = new Map();
    this.isTranslating = false;
    this.translationCache = new Map(); // Cache translations
    this.observer = null;
    this.currentLanguage = "en";
  }

  translatePage(language, translations) {
    if (this.isTranslating) return;
    this.isTranslating = true;

    this.currentLanguage = language;

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
    // Cache translations for faster lookup
    this.translationCache = new Map(Object.entries(arabicTranslations || {}));

    // Don't restore if already in Arabic - just translate new content
    if (this.currentLanguage !== "ar") {
      this.restoreOriginalText();
    }

    // Use requestAnimationFrame for smoother performance
    requestAnimationFrame(() => {
      this.translateTextContent();
      this.translateAttributes();
    });
  }

  translateTextContent() {
    // Get all text nodes more efficiently
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
            parent.classList.contains("language-toggle-btn") || // Skip language button
            !node.textContent.trim() ||
            this.translatedElements.has(node)
          ) {
            // Skip already translated
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

    // Batch process translations for better performance
    const fragment = document.createDocumentFragment();

    textNodes.forEach((textNode) => {
      const originalText = textNode.textContent.trim();
      const translation = this.translationCache.get(originalText);

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

  translateAttributes() {
    // Translate placeholders
    const placeholderElements = document.querySelectorAll(
      "[placeholder]:not([data-translated])"
    );
    placeholderElements.forEach((element) => {
      const originalPlaceholder = element.getAttribute("placeholder");
      const translation = this.translationCache.get(originalPlaceholder);

      if (translation && originalPlaceholder !== translation) {
        if (!this.translatedElements.has(element)) {
          this.translatedElements.set(element, {
            type: "placeholder",
            original: originalPlaceholder,
          });
        }
        element.setAttribute("placeholder", translation);
        element.setAttribute("data-translated", "true"); // Mark as translated
      }
    });

    // Translate titles
    const titleElements = document.querySelectorAll(
      "[title]:not([data-translated])"
    );
    titleElements.forEach((element) => {
      const originalTitle = element.getAttribute("title");
      const translation = this.translationCache.get(originalTitle);

      if (translation && originalTitle !== translation) {
        if (!this.translatedElements.has(element)) {
          this.translatedElements.set(element, {
            type: "title",
            original: originalTitle,
          });
        }
        element.setAttribute("title", translation);
        element.setAttribute("data-translated", "true"); // Mark as translated
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
            element.removeAttribute("data-translated");
            break;
          case "title":
            element.setAttribute("title", data.original);
            element.removeAttribute("data-translated");
            break;
        }
      } catch (error) {
        console.warn("Error restoring translation:", error);
      }
    });

    this.translatedElements.clear();
  }

  // Optimized method for translating new content
  translateNewContent(node) {
    if (this.currentLanguage !== "ar" || !this.translationCache) return;

    // Translate text content in the new node
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
      acceptNode: (textNode) => {
        const parent = textNode.parentElement;
        if (
          !parent ||
          ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName) ||
          !textNode.textContent.trim()
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let textNode;
    while ((textNode = walker.nextNode())) {
      const originalText = textNode.textContent.trim();
      const translation = this.translationCache.get(originalText);

      if (translation && originalText !== translation) {
        this.translatedElements.set(textNode, {
          type: "text",
          original: originalText,
        });
        textNode.textContent = translation;
      }
    }

    // Translate attributes in the new node
    const placeholderElements = node.querySelectorAll
      ? node.querySelectorAll("[placeholder]")
      : [];
    placeholderElements.forEach((element) => {
      const originalPlaceholder = element.getAttribute("placeholder");
      const translation = this.translationCache.get(originalPlaceholder);

      if (translation && originalPlaceholder !== translation) {
        this.translatedElements.set(element, {
          type: "placeholder",
          original: originalPlaceholder,
        });
        element.setAttribute("placeholder", translation);
      }
    });
  }
}

// Create singleton instance
const autoTranslator = new AutoTranslator();

// Hook to use in components
export const useAutoTranslation = () => {
  const { language, translations } = useLanguage();

  useEffect(() => {
    // Immediate translation without delay for faster response
    autoTranslator.translatePage(language, translations);
  }, [language, translations]);

  // Optimized mutation observer
  useEffect(() => {
    if (autoTranslator.observer) {
      autoTranslator.observer.disconnect();
    }

    autoTranslator.observer = new MutationObserver((mutations) => {
      if (language !== "ar") return;

      // Batch process mutations for better performance
      const addedNodes = [];
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (
              node.nodeType === Node.ELEMENT_NODE &&
              node.textContent.trim()
            ) {
              addedNodes.push(node);
            }
          });
        }
      });

      if (addedNodes.length > 0) {
        // Use requestAnimationFrame for smooth updates
        requestAnimationFrame(() => {
          addedNodes.forEach((node) =>
            autoTranslator.translateNewContent(node)
          );
        });
      }
    });

    autoTranslator.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (autoTranslator.observer) {
        autoTranslator.observer.disconnect();
      }
    };
  }, [language, translations]);
};

export default autoTranslator;

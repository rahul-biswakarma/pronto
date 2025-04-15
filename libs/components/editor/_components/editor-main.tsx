"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorContext } from "../editor.context";
import { EditorInput } from "./editor-input";

// Helper function to get XPath for an element
const getXPath = (element: HTMLElement): string => {
    if (!element) return "";
    if (element.id) return `//*[@id="${element.id}"]`;

    // Use a more reliable approach
    const path = [];
    let currentElement: HTMLElement | null = element;

    while (currentElement && currentElement.nodeType === Node.ELEMENT_NODE) {
        let name = currentElement.nodeName.toLowerCase();
        let sibling = currentElement.previousSibling;
        let siblingCount = 1;

        // Count previous siblings with same node name
        while (sibling) {
            if (
                sibling.nodeType === Node.ELEMENT_NODE &&
                sibling.nodeName.toLowerCase() === name
            ) {
                siblingCount++;
            }
            sibling = sibling.previousSibling;
        }

        // If element has siblings of the same type, add index
        if (currentElement.nextSibling || siblingCount > 1) {
            name += `[${siblingCount}]`;
        }

        path.unshift(name);
        currentElement = currentElement.parentElement;
    }

    return path.length > 0 ? `/${path.join("/")}` : "";
};

// Helper to check if element is a text element
const isTextElement = (element: HTMLElement): boolean => {
    return (
        (element.childNodes.length === 0 ||
            (element.childNodes.length === 1 &&
                element.firstChild?.nodeType === Node.TEXT_NODE) ||
            [
                "P",
                "H1",
                "H2",
                "H3",
                "H4",
                "H5",
                "H6",
                "SPAN",
                "A",
                "BUTTON",
                "LI",
                "TD",
                "TH",
                "LABEL",
                "FIGCAPTION",
            ].includes(element.tagName)) &&
        !!element.textContent?.trim()
    );
};

export const EditorMain = () => {
    const {
        portfolioHtml,
        portfolioContent,
        setSelectedSection,
        selectedSection,
        activeMode,
        setActiveMode,
        selectedCmsElement,
        setSelectedCmsElement,
    } = useEditorContext();

    const [renderedHtml, setRenderedHtml] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [hoverHighlight, setHoverHighlight] = useState<string | null>(null);
    const [hoverCmsElement, setHoverCmsElement] = useState<HTMLElement | null>(
        null,
    );
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (portfolioHtml && portfolioContent) {
            try {
                setRenderedHtml(portfolioHtml);

                // Update iframe content if iframe is ready
                if (iframeRef.current) {
                    const doc = iframeRef.current.contentDocument;
                    if (doc) {
                        doc.open();
                        doc.write(portfolioHtml);
                        doc.close();

                        // Apply mouse event listeners after iframe content is loaded
                        setupEventListeners(doc);
                    }
                }
            } catch (error) {
                console.error("Error rendering template:", error);
            }
        }
    }, [
        portfolioHtml,
        portfolioContent,
        setSelectedSection,
        selectedSection,
        activeMode,
        selectedCmsElement,
    ]);

    // Setup event listeners on iframe content
    const setupEventListeners = (doc: Document) => {
        // Add a style block for the highlight effects
        const styleEl = doc.createElement("style");
        styleEl.textContent = `
            /* Base styles to prevent default browser styles from showing */
            [id^="feno-sec"], p, h1, h2, h3, h4, h5, h6, span, a, button, li, td, th, label, figcaption {
                transition: outline 0.1s ease, background-color 0.1s ease !important;
            }

            .feno-hover {
                outline: 2px dashed #3b82f6 !important;
                outline-offset: 1px !important;
                background-color: rgba(59, 130, 246, 0.05) !important;
                transition: none !important;
                position: relative !important;
                z-index: 10 !important;
                box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.1) !important;
            }

            .feno-selected {
                outline: 3px solid #3b82f6 !important;
                outline-offset: 1px !important;
                background-color: rgba(59, 130, 246, 0.1) !important;
                transition: none !important;
                position: relative !important;
                z-index: 20 !important;
                box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2) !important;
            }

            .feno-cms-hover {
                outline: 2px dashed #eab308 !important;
                outline-offset: 1px !important;
                background-color: rgba(234, 179, 8, 0.05) !important;
                transition: none !important;
                position: relative !important;
                z-index: 10 !important;
                box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.1) !important;
            }

            .feno-cms-selected {
                outline: 3px solid #eab308 !important;
                outline-offset: 1px !important;
                background-color: rgba(234, 179, 8, 0.1) !important;
                transition: none !important;
                position: relative !important;
                z-index: 20 !important;
                box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.2) !important;
            }
        `;
        doc.head.appendChild(styleEl);

        // Clear all highlights
        const clearAllHighlights = () => {
            const highlightedElements = doc.querySelectorAll(
                ".feno-hover, .feno-cms-hover",
            );
            for (const el of highlightedElements) {
                el.classList.remove("feno-hover", "feno-cms-hover");
            }
            setHoverHighlight(null);
            setHoverCmsElement(null);
        };

        // Clear any pending hover timeout
        const clearHoverTimeout = () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
            }
        };

        // Add mouseover event to the document
        doc.body.addEventListener("mouseover", (e) => {
            const target = e.target as HTMLElement;

            // Clear any pending hover timeout
            clearHoverTimeout();

            // Set a timeout for the hover effect (50ms delay)
            hoverTimeoutRef.current = setTimeout(() => {
                // Only apply hover effects for elements relevant to the current mode
                // or in default mode where both section and text highlighting are allowed

                // First check if this is a text element
                if (isTextElement(target)) {
                    // Only apply text highlighting in default mode or cms-edit mode
                    if (activeMode === "default" || activeMode === "cms-edit") {
                        // Clear previous highlights
                        clearAllHighlights();

                        // Don't apply hover highlight to selected element
                        if (
                            activeMode === "cms-edit" &&
                            selectedCmsElement?.element === target
                        ) {
                            return;
                        }

                        // Add hover highlight for text element
                        target.classList.add("feno-cms-hover");
                        setHoverCmsElement(target);
                    }
                } else {
                    // Not a text element, try to find a section
                    const fenoSection = target.closest(
                        '[id^="feno-sec"]',
                    ) as HTMLElement;

                    // Only apply section highlighting in default mode or section-edit mode
                    if (
                        fenoSection &&
                        (activeMode === "default" ||
                            activeMode === "section-edit")
                    ) {
                        // Clear previous highlights
                        clearAllHighlights();

                        const sectionId = fenoSection.id;

                        // Don't apply hover highlight to selected section
                        if (
                            activeMode === "section-edit" &&
                            selectedSection?.id === sectionId
                        ) {
                            return;
                        }

                        // Add hover highlight for section
                        fenoSection.classList.add("feno-hover");
                        setHoverHighlight(sectionId);
                    }
                }
            }, 50); // 50ms delay for hover effect
        });

        // Add mouseout event to the document
        doc.body.addEventListener("mouseout", (e) => {
            const relatedTarget = e.relatedTarget as HTMLElement;
            const target = e.target as HTMLElement;

            // Clear any pending hover timeout
            clearHoverTimeout();

            // Handle text element mouseout
            if (target === hoverCmsElement) {
                if (
                    !selectedCmsElement ||
                    target !== selectedCmsElement.element
                ) {
                    target.classList.remove("feno-cms-hover");
                    setHoverCmsElement(null);
                }
            }

            // Handle section mouseout
            if (target.closest('[id^="feno-sec"]') === target) {
                const targetSection = target.closest('[id^="feno-sec"]');
                const relatedSection =
                    relatedTarget?.closest('[id^="feno-sec"]');

                if (
                    targetSection &&
                    (!relatedSection || targetSection.id !== relatedSection.id)
                ) {
                    if (
                        !selectedSection ||
                        selectedSection.id !== targetSection.id
                    ) {
                        targetSection.classList.remove("feno-hover");
                    }
                    setHoverHighlight(null);
                }
            }
        });

        // Add click event to handle selection/deselection
        doc.body.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;

            // First check if this is a text element
            if (isTextElement(target)) {
                // Clear any existing selection
                if (selectedSection) {
                    const prevSection = doc.getElementById(selectedSection.id);
                    if (prevSection) {
                        prevSection.classList.remove("feno-selected");
                    }
                    setSelectedSection(null);
                }

                if (selectedCmsElement?.element) {
                    selectedCmsElement.element.classList.remove(
                        "feno-cms-selected",
                    );
                }

                // If clicking on already selected CMS element, deselect it
                if (selectedCmsElement?.element === target) {
                    setSelectedCmsElement(null);
                    setActiveMode("default");
                    return;
                }

                // Select the text element
                target.classList.remove("feno-cms-hover");
                target.classList.add("feno-cms-selected");

                // Calculate XPath for the element
                const xpath = getXPath(target);

                // Store the element in context and switch to CMS mode
                setSelectedCmsElement({
                    element: target,
                    originalText: target.textContent || "",
                    path: xpath,
                });
                setActiveMode("cms-edit");
            } else {
                // Not a text element, try to find a section
                const fenoSection = target.closest(
                    '[id^="feno-sec"]',
                ) as HTMLElement;

                if (fenoSection) {
                    // Clear any existing CMS selection
                    if (selectedCmsElement?.element) {
                        selectedCmsElement.element.classList.remove(
                            "feno-cms-selected",
                        );
                        setSelectedCmsElement(null);
                    }

                    const sectionId = fenoSection.id;

                    // If clicking on already selected section, deselect it
                    if (selectedSection?.id === sectionId) {
                        fenoSection.classList.remove("feno-selected");
                        setSelectedSection(null);
                        setActiveMode("default");
                        return;
                    }

                    // Deselect previously selected section if any
                    if (selectedSection) {
                        const prevSection = doc.getElementById(
                            selectedSection.id,
                        );
                        if (prevSection) {
                            prevSection.classList.remove("feno-selected");
                        }
                    }

                    // Select the section
                    fenoSection.classList.remove("feno-hover");
                    fenoSection.classList.add("feno-selected");

                    // Store the section and switch to section-edit mode
                    setSelectedSection({
                        id: sectionId,
                        html: fenoSection.outerHTML,
                    });
                    setActiveMode("section-edit");
                } else {
                    // Clicking outside any selectable element, deselect everything
                    if (selectedSection) {
                        const prevSection = doc.getElementById(
                            selectedSection.id,
                        );
                        if (prevSection) {
                            prevSection.classList.remove("feno-selected");
                        }
                        setSelectedSection(null);
                    }

                    if (selectedCmsElement?.element) {
                        selectedCmsElement.element.classList.remove(
                            "feno-cms-selected",
                        );
                        setSelectedCmsElement(null);
                    }

                    setActiveMode("default");
                }
            }

            // Prevent the click from bubbling up
            e.stopPropagation();
        });
    };

    // Handle iframe load event to update content
    const handleIframeLoad = () => {
        if (iframeRef.current && renderedHtml) {
            const doc = iframeRef.current.contentDocument;
            if (doc) {
                doc.open();
                doc.write(renderedHtml);
                doc.close();

                // Setup event listeners after iframe load
                setupEventListeners(doc);

                // Restore selected elements based on active mode
                if (activeMode === "section-edit" && selectedSection) {
                    const selectedElement = doc.getElementById(
                        selectedSection.id,
                    );
                    if (selectedElement) {
                        selectedElement.classList.add("feno-selected");
                    }
                } else if (activeMode === "cms-edit" && selectedCmsElement) {
                    try {
                        // Sanitize the XPath to ensure it's valid
                        const path = selectedCmsElement.path;
                        if (!path) {
                            console.error("Invalid XPath: path is empty");
                            return;
                        }

                        // Try to find the element
                        let element = null;
                        try {
                            element = doc.evaluate(
                                path,
                                doc,
                                null,
                                XPathResult.FIRST_ORDERED_NODE_TYPE,
                                null,
                            ).singleNodeValue as HTMLElement;
                        } catch (err) {
                            console.error("XPath evaluation error:", err);
                            // Fallback to more basic selector if possible
                            if (path.includes("id=")) {
                                const idMatch = path.match(/id="([^"]+)"/);
                                if (idMatch?.[1]) {
                                    element = doc.getElementById(idMatch[1]);
                                }
                            }
                        }

                        if (element) {
                            element.classList.add("feno-cms-selected");
                        } else {
                            console.warn(
                                "Could not find element with path:",
                                path,
                            );
                        }
                    } catch (error) {
                        console.error(
                            "Error restoring CMS element highlight:",
                            error,
                        );
                    }
                }
            }
        }
    };

    return (
        <>
            <iframe
                ref={iframeRef}
                title="Portfolio Preview"
                onLoad={handleIframeLoad}
                style={{
                    backgroundColor: "transparent",
                    width: "100vw",
                    height: "100vh",
                    border: "none",
                }}
            />
            <EditorInput />
        </>
    );
};

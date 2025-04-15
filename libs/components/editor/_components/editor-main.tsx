"use client";

import { useEffect, useRef, useState } from "react";
import { EDITOR_MODES, HOVER_DELAY_MS, SECTION_ID_PREFIX } from "../constants";
import { useEditorContext } from "../editor.context";
import { ModeSelector } from "../modes/ModeSelector";
import {
    findClosestSection,
    findElementByXPath,
    getXPath,
    isTextElement,
} from "../utils/dom";
import {
    addCmsHighlight,
    addSectionHighlight,
    clearAllHighlights,
    removeCmsHighlight,
    removeSectionHighlight,
    setupHighlightStyles,
} from "../utils/highlight";

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
        // Add styles for highlighting
        setupHighlightStyles(doc);

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

            // Set a timeout for the hover effect
            hoverTimeoutRef.current = setTimeout(() => {
                // Only apply hover effects for elements relevant to the current mode
                // or in default mode where both section and text highlighting are allowed

                // First check if this is a text element
                if (isTextElement(target)) {
                    // Only apply text highlighting in default mode or cms-edit mode
                    if (
                        activeMode === EDITOR_MODES.DEFAULT ||
                        activeMode === EDITOR_MODES.CMS_EDIT
                    ) {
                        // Clear previous highlights
                        clearAllHighlights(
                            doc,
                            setHoverHighlight,
                            setHoverCmsElement,
                        );

                        // Don't apply hover highlight to selected element
                        if (
                            activeMode === EDITOR_MODES.CMS_EDIT &&
                            selectedCmsElement?.element === target
                        ) {
                            return;
                        }

                        // Add hover highlight for text element
                        addCmsHighlight(target);
                        setHoverCmsElement(target);
                    }
                } else {
                    // Not a text element, try to find a section
                    const fenoSection = findClosestSection(target);

                    // Only apply section highlighting in default mode or section-edit mode
                    if (
                        fenoSection &&
                        (activeMode === EDITOR_MODES.DEFAULT ||
                            activeMode === EDITOR_MODES.SECTION_EDIT)
                    ) {
                        // Clear previous highlights
                        clearAllHighlights(
                            doc,
                            setHoverHighlight,
                            setHoverCmsElement,
                        );

                        const sectionId = fenoSection.id;

                        // Don't apply hover highlight to selected section
                        if (
                            activeMode === EDITOR_MODES.SECTION_EDIT &&
                            selectedSection?.id === sectionId
                        ) {
                            return;
                        }

                        // Add hover highlight for section
                        addSectionHighlight(fenoSection);
                        setHoverHighlight(sectionId);
                    }
                }
            }, HOVER_DELAY_MS);
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
                    removeCmsHighlight(target);
                    setHoverCmsElement(null);
                }
            }

            // Handle section mouseout
            if (target.closest(`[id^="${SECTION_ID_PREFIX}"]`) === target) {
                const targetSection = target.closest(
                    `[id^="${SECTION_ID_PREFIX}"]`,
                );
                const relatedSection = relatedTarget?.closest(
                    `[id^="${SECTION_ID_PREFIX}"]`,
                );

                if (
                    targetSection &&
                    (!relatedSection || targetSection.id !== relatedSection.id)
                ) {
                    if (
                        !selectedSection ||
                        selectedSection.id !== targetSection.id
                    ) {
                        removeSectionHighlight(targetSection as HTMLElement);
                    }
                    setHoverHighlight(null);
                }
            }
        });

        // Add click event to handle selection/deselection
        doc.body.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;

            // First check if we're in a specific editing mode already
            if (activeMode === EDITOR_MODES.CMS_EDIT) {
                // In CMS mode, only allow clicking on text elements
                if (isTextElement(target)) {
                    // If clicking on already selected CMS element, deselect it
                    if (selectedCmsElement?.element === target) {
                        removeCmsHighlight(selectedCmsElement.element, true);
                        setSelectedCmsElement(null);
                        setActiveMode(EDITOR_MODES.DEFAULT);
                    } else {
                        // Deselect previous element if any
                        if (selectedCmsElement?.element) {
                            removeCmsHighlight(
                                selectedCmsElement.element,
                                true,
                            );
                        }

                        // Select the new text element
                        removeCmsHighlight(target);
                        addCmsHighlight(target, true);

                        // Update the selected element
                        setSelectedCmsElement({
                            element: target,
                            originalText: target.textContent || "",
                            path: getXPath(target),
                        });
                    }
                } else if (target.closest(".feno-cms-selected")) {
                    // Clicking inside a selected text element (e.g., on a nested span)
                    // Do nothing, keep the current selection
                } else {
                    // Clicking outside text elements in CMS mode
                    // Just deselect and go to default mode
                    if (selectedCmsElement?.element) {
                        removeCmsHighlight(selectedCmsElement.element, true);
                        setSelectedCmsElement(null);
                    }
                    setActiveMode(EDITOR_MODES.DEFAULT);
                }
            } else if (activeMode === EDITOR_MODES.SECTION_EDIT) {
                // In Section mode, only allow clicking on sections
                const fenoSection = findClosestSection(target);

                if (fenoSection) {
                    const sectionId = fenoSection.id;

                    // If clicking on already selected section, deselect it
                    if (selectedSection?.id === sectionId) {
                        removeSectionHighlight(fenoSection, true);
                        setSelectedSection(null);
                        setActiveMode(EDITOR_MODES.DEFAULT);
                    } else {
                        // Deselect previously selected section if any
                        if (selectedSection) {
                            const prevSection = doc.getElementById(
                                selectedSection.id,
                            );
                            if (prevSection) {
                                removeSectionHighlight(prevSection, true);
                            }
                        }

                        // Select the new section
                        removeSectionHighlight(fenoSection);
                        addSectionHighlight(fenoSection, true);

                        // Update selected section
                        setSelectedSection({
                            id: sectionId,
                            html: fenoSection.outerHTML,
                        });
                    }
                } else {
                    // Clicking outside sections in Section edit mode
                    // Just deselect and go to default mode
                    if (selectedSection) {
                        const prevSection = doc.getElementById(
                            selectedSection.id,
                        );
                        if (prevSection) {
                            removeSectionHighlight(prevSection, true);
                        }
                        setSelectedSection(null);
                    }
                    setActiveMode(EDITOR_MODES.DEFAULT);
                }
            } else {
                // In default mode, allow switching between modes based on what was clicked
                // First check if this is a text element
                if (isTextElement(target)) {
                    // Clear any existing selection
                    if (selectedSection) {
                        const prevSection = doc.getElementById(
                            selectedSection.id,
                        );
                        if (prevSection) {
                            removeSectionHighlight(prevSection, true);
                        }
                        setSelectedSection(null);
                    }

                    if (selectedCmsElement?.element) {
                        removeCmsHighlight(selectedCmsElement.element, true);
                    }

                    // Select the text element
                    removeCmsHighlight(target);
                    addCmsHighlight(target, true);

                    // Calculate XPath for the element
                    const xpath = getXPath(target);

                    // Store the element in context and switch to CMS mode
                    setSelectedCmsElement({
                        element: target,
                        originalText: target.textContent || "",
                        path: xpath,
                    });
                    setActiveMode(EDITOR_MODES.CMS_EDIT);
                } else {
                    // Not a text element, try to find a section
                    const fenoSection = findClosestSection(target);

                    if (fenoSection) {
                        // Clear any existing CMS selection
                        if (selectedCmsElement?.element) {
                            removeCmsHighlight(
                                selectedCmsElement.element,
                                true,
                            );
                            setSelectedCmsElement(null);
                        }

                        const sectionId = fenoSection.id;

                        // Select the section
                        removeSectionHighlight(fenoSection);
                        addSectionHighlight(fenoSection, true);

                        // Store the section and switch to section-edit mode
                        setSelectedSection({
                            id: sectionId,
                            html: fenoSection.outerHTML,
                        });
                        setActiveMode(EDITOR_MODES.SECTION_EDIT);
                    } else {
                        // Clicking outside any selectable element, deselect everything
                        if (selectedSection) {
                            const prevSection = doc.getElementById(
                                selectedSection.id,
                            );
                            if (prevSection) {
                                removeSectionHighlight(prevSection, true);
                            }
                            setSelectedSection(null);
                        }

                        if (selectedCmsElement?.element) {
                            removeCmsHighlight(
                                selectedCmsElement.element,
                                true,
                            );
                            setSelectedCmsElement(null);
                        }
                    }
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
                if (
                    activeMode === EDITOR_MODES.SECTION_EDIT &&
                    selectedSection
                ) {
                    const selectedElement = doc.getElementById(
                        selectedSection.id,
                    );
                    if (selectedElement) {
                        addSectionHighlight(selectedElement, true);
                    }
                } else if (
                    activeMode === EDITOR_MODES.CMS_EDIT &&
                    selectedCmsElement
                ) {
                    try {
                        // Find the element using XPath
                        const element = findElementByXPath(
                            doc,
                            selectedCmsElement.path,
                        );

                        if (element) {
                            addCmsHighlight(element, true);
                        } else {
                            console.warn(
                                "Could not find element with path:",
                                selectedCmsElement.path,
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
            <ModeSelector />
        </>
    );
};

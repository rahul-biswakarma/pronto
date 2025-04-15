"use client";

import logger from "@/libs/utils/logger";
import { useEffect, useRef, useState } from "react";
import { EDITOR_MODES, HOVER_DELAY_MS, SECTION_ID_PREFIX } from "../constants";
import { useEditorContext } from "../editor.context";
import { ModeSelector } from "../modes/mode-selector";
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
                logger.error({ error }, "Error rendering template");
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

            // Stop propagation immediately to prevent any nested handlers
            e.stopPropagation();

            // Handle clicks based on the current mode
            switch (activeMode) {
                // CMS EDIT MODE
                case EDITOR_MODES.CMS_EDIT: {
                    // In CMS mode, we ONLY care about text elements or exiting the mode

                    // Check if clicking directly on the selected element
                    if (selectedCmsElement?.element === target) {
                        // Deselect and exit to default mode
                        removeCmsHighlight(selectedCmsElement.element, true);
                        setSelectedCmsElement(null);
                        setActiveMode(EDITOR_MODES.DEFAULT);
                        return;
                    }

                    // Check if clicking on another valid text element
                    if (isTextElement(target)) {
                        // Deselect the current element
                        if (selectedCmsElement?.element) {
                            removeCmsHighlight(
                                selectedCmsElement.element,
                                true,
                            );
                        }

                        // Select the new text element
                        addCmsHighlight(target, true);

                        // Update the selected element
                        setSelectedCmsElement({
                            element: target,
                            originalText: target.textContent || "",
                            path: getXPath(target),
                        });
                        return;
                    }

                    // Check if clicking inside a selected element (on a child)
                    const closestSelected =
                        target.closest(".feno-cms-selected");
                    if (closestSelected) {
                        // Do nothing, keep the current selection
                        return;
                    }

                    // If we get here, it's a click outside any valid text elements
                    // Deselect the current element and exit CMS mode
                    if (selectedCmsElement?.element) {
                        removeCmsHighlight(selectedCmsElement.element, true);
                        setSelectedCmsElement(null);
                    }
                    setActiveMode(EDITOR_MODES.DEFAULT);
                    return;
                }

                // SECTION EDIT MODE
                case EDITOR_MODES.SECTION_EDIT: {
                    // In Section edit mode, we ONLY care about section elements or exiting the mode
                    const fenoSection = findClosestSection(target);

                    // Check if clicking on the currently selected section
                    if (
                        selectedSection &&
                        fenoSection &&
                        selectedSection.id === fenoSection.id
                    ) {
                        // Deselect and exit to default mode
                        removeSectionHighlight(fenoSection, true);
                        setSelectedSection(null);
                        setActiveMode(EDITOR_MODES.DEFAULT);
                        return;
                    }

                    // Check if clicking on another valid section
                    if (fenoSection) {
                        // Deselect the current section
                        if (selectedSection) {
                            const prevElement = doc.getElementById(
                                selectedSection.id,
                            );
                            if (prevElement) {
                                removeSectionHighlight(prevElement, true);
                            }
                        }

                        // Select the new section
                        addSectionHighlight(fenoSection, true);

                        // Update the selected section
                        setSelectedSection({
                            id: fenoSection.id,
                            html: fenoSection.outerHTML,
                        });
                        return;
                    }

                    // Check if clicking inside the currently selected section (on a child)
                    if (selectedSection) {
                        const selectedElement = doc.getElementById(
                            selectedSection.id,
                        );
                        if (selectedElement?.contains(target)) {
                            // Do nothing, keep the current selection
                            return;
                        }
                    }

                    // If we get here, it's a click outside any valid section
                    // Deselect the current section and exit Section mode
                    if (selectedSection) {
                        const element = doc.getElementById(selectedSection.id);
                        if (element) {
                            removeSectionHighlight(element, true);
                        }
                        setSelectedSection(null);
                    }
                    setActiveMode(EDITOR_MODES.DEFAULT);
                    return;
                }

                // DEFAULT MODE - ALLOW MODE SWITCHING
                default: {
                    // In default mode, determine what was clicked and enter the appropriate mode

                    // Check if this is a text element - prioritize text selection
                    if (isTextElement(target)) {
                        // Clear any existing section selection
                        if (selectedSection) {
                            const element = doc.getElementById(
                                selectedSection.id,
                            );
                            if (element) {
                                removeSectionHighlight(element, true);
                            }
                            setSelectedSection(null);
                        }

                        // Select the text element and enter CMS mode
                        addCmsHighlight(target, true);

                        setSelectedCmsElement({
                            element: target,
                            originalText: target.textContent || "",
                            path: getXPath(target),
                        });
                        setActiveMode(EDITOR_MODES.CMS_EDIT);
                        return;
                    }

                    // Check if this is a section element
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

                        // Select the section and enter Section edit mode
                        addSectionHighlight(fenoSection, true);

                        setSelectedSection({
                            id: fenoSection.id,
                            html: fenoSection.outerHTML,
                        });
                        setActiveMode(EDITOR_MODES.SECTION_EDIT);
                        return;
                    }

                    // Clicking outside any selectable element, ensure everything is deselected
                    if (selectedSection) {
                        const element = doc.getElementById(selectedSection.id);
                        if (element) {
                            removeSectionHighlight(element, true);
                        }
                        setSelectedSection(null);
                    }

                    if (selectedCmsElement?.element) {
                        removeCmsHighlight(selectedCmsElement.element, true);
                        setSelectedCmsElement(null);
                    }
                }
            }
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
                            logger.warn(
                                { path: selectedCmsElement.path },
                                "Could not find element with path",
                            );
                        }
                    } catch (error) {
                        logger.error(
                            { error },
                            "Error restoring CMS element highlight",
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

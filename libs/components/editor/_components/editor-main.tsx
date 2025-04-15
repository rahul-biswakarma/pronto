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
import { DeviceViewport } from "./device-viewport";

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
        deviceType,
    } = useEditorContext();

    const [renderedHtml, setRenderedHtml] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [hoverHighlight, setHoverHighlight] = useState<string | null>(null);
    const [hoverCmsElement, setHoverCmsElement] = useState<HTMLElement | null>(
        null,
    );
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (portfolioHtml && portfolioContent) {
            try {
                setRenderedHtml(portfolioHtml);

                // Update iframe content if iframe is ready
                if (iframeRef.current) {
                    const doc = iframeRef.current.contentDocument;
                    if (doc) {
                        // Only write to the iframe if it's empty or content has changed
                        if (
                            !doc.body ||
                            !doc.body.innerHTML ||
                            doc.body.innerHTML.trim() === ""
                        ) {
                            doc.open();
                            doc.write(portfolioHtml);
                            doc.close();

                            // Apply mouse event listeners after iframe content is loaded
                            setupEventListeners(doc);
                        }
                    }
                }
            } catch (error) {
                logger.error({ error }, "Error rendering template");
            }
        }
    }, [
        portfolioHtml,
        portfolioContent,
        // Remove dependencies that shouldn't cause iframe reloading
        // These will still be accessible in the useEffect, but won't trigger re-renders
        // setSelectedSection,
        // selectedSection,
        // activeMode,
        // selectedCmsElement,
    ]);

    // Set up a separate effect for handling device type changes
    useEffect(() => {
        // When device type changes, we need to ensure the iframe content is preserved
        // We'll just make sure event listeners are set up correctly
        if (iframeRef.current && renderedHtml) {
            // Use optional chaining as suggested by linter
            const doc = iframeRef.current.contentDocument;
            if (doc?.body?.innerHTML) {
                // Re-setup event listeners since the iframe may have been remounted in the DOM
                setupEventListeners(doc);

                // Restore any highlighting based on active mode
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
                        const element = findElementByXPath(
                            doc,
                            selectedCmsElement.path,
                        );
                        if (element) {
                            addCmsHighlight(element, true);
                        }
                    } catch (error) {
                        logger.error(
                            { error },
                            "Error restoring CMS element highlight on device change",
                        );
                    }
                }
            }
        }
    }, [deviceType, renderedHtml]);

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
                // Check if the iframe is already populated to avoid rewriting on viewport changes
                if (
                    !doc.body ||
                    !doc.body.innerHTML ||
                    doc.body.innerHTML.trim() === ""
                ) {
                    doc.open();
                    doc.write(renderedHtml);
                    doc.close();
                }

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
            {activeMode !== EDITOR_MODES.DEVELOPER && (
                <div className="relative w-full h-full">
                    <DeviceViewport deviceType={deviceType}>
                        <iframe
                            ref={iframeRef}
                            title="Portfolio Preview"
                            onLoad={handleIframeLoad}
                            key="portfolio-preview-iframe"
                            style={{
                                backgroundColor: "transparent",
                                width: "100%",
                                height: "100%",
                                border: "none",
                            }}
                            srcDoc={renderedHtml || ""}
                        />
                    </DeviceViewport>
                </div>
            )}
            <ModeSelector />
        </>
    );
};

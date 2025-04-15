"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorContext } from "../editor.context";
import { EditorInput } from "./editor-input";

export const EditorMain = () => {
    const {
        portfolioHtml,
        portfolioContent,
        setSelectedSection,
        selectedSection,
    } = useEditorContext();
    const [renderedHtml, setRenderedHtml] = useState<string | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [hoverHighlight, setHoverHighlight] = useState<string | null>(null);

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
    }, [portfolioHtml, portfolioContent, setSelectedSection, selectedSection]);

    // Setup hover event listeners on iframe content
    const setupEventListeners = (doc: Document) => {
        // Add a style block for the highlight effects
        const styleEl = doc.createElement("style");
        styleEl.textContent = `
            .feno-hover {
                outline: 2px dashed #3b82f6 !important;
                background-color: rgba(59, 130, 246, 0.05) !important;
                transition: all 0.2s ease-in-out !important;
                position: relative !important;
                z-index: 1 !important;
            }
            .feno-selected {
                outline: 3px solid #3b82f6 !important;
                background-color: rgba(59, 130, 246, 0.1) !important;
                transition: all 0.2s ease-in-out !important;
                position: relative !important;
                z-index: 2 !important;
            }
        `;
        doc.head.appendChild(styleEl);

        // Add mouseover event to the document
        doc.body.addEventListener("mouseover", (e) => {
            const target = e.target as HTMLElement;

            // Find the closest parent with ID starting with feno-sec
            const fenoSection = target.closest(
                '[id^="feno-sec"]',
            ) as HTMLElement;

            if (fenoSection) {
                const sectionId = fenoSection.id;

                // Don't apply hover highlight to selected section
                if (selectedSection && selectedSection.id === sectionId) {
                    return;
                }

                // Remove previous hover highlight if any
                if (hoverHighlight && hoverHighlight !== sectionId) {
                    const prevElement = doc.getElementById(hoverHighlight);
                    if (
                        prevElement &&
                        (!selectedSection ||
                            selectedSection.id !== hoverHighlight)
                    ) {
                        prevElement.classList.remove("feno-hover");
                    }
                }

                // Add hover highlight to current section
                fenoSection.classList.add("feno-hover");
                setHoverHighlight(sectionId);
            }
        });

        // Add mouseout event to the document
        doc.body.addEventListener("mouseout", (e) => {
            const relatedTarget = e.relatedTarget as HTMLElement;
            const target = e.target as HTMLElement;

            // Check if we're moving outside a feno-sec element
            const targetSection = target.closest('[id^="feno-sec"]');
            const relatedSection = relatedTarget?.closest('[id^="feno-sec"]');

            // If we're moving from one section to a different one, or leaving a section entirely
            if (
                targetSection &&
                (!relatedSection || targetSection.id !== relatedSection.id)
            ) {
                // Only remove hover highlight if this section isn't selected
                if (
                    !selectedSection ||
                    selectedSection.id !== targetSection.id
                ) {
                    targetSection.classList.remove("feno-hover");
                }
                setHoverHighlight(null);
            }
        });

        // Add click event to handle section selection/deselection
        doc.body.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;

            // Find the closest parent with ID starting with feno-sec
            const fenoSection = target.closest(
                '[id^="feno-sec"]',
            ) as HTMLElement;

            if (fenoSection) {
                const sectionId = fenoSection.id;

                // If clicking on already selected section, deselect it
                if (selectedSection && selectedSection.id === sectionId) {
                    fenoSection.classList.remove("feno-selected");

                    // Restore hover highlight if mouse is still over it
                    if (hoverHighlight === sectionId) {
                        fenoSection.classList.add("feno-hover");
                    }

                    setSelectedSection(null);
                } else {
                    // Deselect previously selected section if any
                    if (selectedSection) {
                        const prevSelected = doc.getElementById(
                            selectedSection.id,
                        );
                        if (prevSelected) {
                            prevSelected.classList.remove("feno-selected");
                        }
                    }

                    // Remove hover highlight and add selected highlight
                    fenoSection.classList.remove("feno-hover");
                    fenoSection.classList.add("feno-selected");

                    // Store the section in context
                    setSelectedSection({
                        id: sectionId,
                        html: fenoSection.outerHTML,
                    });
                }

                // Prevent the click from bubbling up
                e.stopPropagation();
            } else if (selectedSection) {
                // If clicking outside all sections, deselect current section
                const currentSelected = doc.getElementById(selectedSection.id);
                if (currentSelected) {
                    currentSelected.classList.remove("feno-selected");
                }
                setSelectedSection(null);
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

                // Restore selected section highlight if any
                if (selectedSection) {
                    const selectedElement = doc.getElementById(
                        selectedSection.id,
                    );
                    if (selectedElement) {
                        selectedElement.classList.add("feno-selected");
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

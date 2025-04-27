import { Button } from "@/libs/ui/button";
import { Input } from "@/libs/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/libs/ui/tabs";
import { IconAlertCircle, IconSearch, IconX } from "@tabler/icons-react";
import { useCallback, useState } from "react";
import { useEditor } from "../../context/editor.context";
import { getAllBlocks, searchBlocks } from "./block-registry";
import type { BlockInfo } from "./block-registry";
import { BlockCard } from "./components/block-card";
import { BlockConfigurationPanel } from "./components/block-configuration-panel";
import { BlockInsertionHighlighting } from "./components/block-insertion-highlighting";

export const BlockEditor: React.FC = () => {
    const { iframeDocument, iframeRef } = useEditor();
    const [searchQuery, setSearchQuery] = useState("");
    const [isSelectingInsertionPoint, setIsSelectingInsertionPoint] =
        useState(false);
    const [selectedBlock, setSelectedBlock] = useState<BlockInfo | null>(null);
    const [blockConfig, setBlockConfig] = useState<unknown | null>(null);
    const [selectedInsertionElement, setSelectedInsertionElement] =
        useState<HTMLElement | null>(null);
    const [selectedInsertionPosition, setSelectedInsertionPosition] = useState<
        "before" | "after" | "append"
    >("after");

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    // Get blocks based on search query
    const blocks = searchQuery ? searchBlocks(searchQuery) : getAllBlocks();

    // When a block is selected
    const handleBlockSelect = (block: BlockInfo) => {
        setSelectedBlock(block);
        setBlockConfig(block.defaultConfig);
        setIsSelectingInsertionPoint(true);
    };

    // When a insertion point is selected
    const handleInsertionPointSelected = useCallback(
        (element: HTMLElement, position: "before" | "after" | "append") => {
            setSelectedInsertionElement(element);
            setSelectedInsertionPosition(position);
            setIsSelectingInsertionPoint(false);
        },
        [],
    );

    // When block configuration changes
    const handleConfigChange = (newConfig: unknown) => {
        setBlockConfig(newConfig);
    };

    // Insert the block into the document
    const handleInsertBlock = () => {
        if (
            !selectedBlock ||
            !selectedInsertionElement ||
            !blockConfig ||
            !iframeDocument
        ) {
            return;
        }

        try {
            // Generate the block HTML
            const blockHTML = selectedBlock.generateHTML(blockConfig);

            // Create temporary container for the HTML
            const temp = iframeDocument.createElement("div");
            temp.innerHTML = blockHTML.trim();

            // Insert at the appropriate position
            if (selectedInsertionPosition === "before") {
                selectedInsertionElement.insertAdjacentHTML(
                    "beforebegin",
                    blockHTML,
                );
            } else if (selectedInsertionPosition === "after") {
                selectedInsertionElement.insertAdjacentHTML(
                    "afterend",
                    blockHTML,
                );
            } else {
                // Append inside the element
                selectedInsertionElement.insertAdjacentHTML(
                    "beforeend",
                    blockHTML,
                );
            }

            // Reset state
            setSelectedBlock(null);
            setBlockConfig(null);
            setSelectedInsertionElement(null);
        } catch (error) {
            console.error("Failed to insert block:", error);
        }
    };

    // Cancel the insertion process
    const handleCancelInsertion = () => {
        setIsSelectingInsertionPoint(false);
        setSelectedBlock(null);
        setBlockConfig(null);
        setSelectedInsertionElement(null);
    };

    return (
        <div className="p-4 w-full max-w-[80vw] mx-auto feno-mod-container">
            <BlockInsertionHighlighting
                iframeDocument={iframeDocument}
                isSelectingInsertionPoint={isSelectingInsertionPoint}
                onInsertionPointSelected={handleInsertionPointSelected}
            />

            {isSelectingInsertionPoint ? (
                <div className="bg-[var(--feno-surface-1)] p-4 rounded-lg shadow-md mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                        <IconAlertCircle
                            className="text-[var(--feno-primary)]"
                            size={16}
                        />
                        Click on the page to select where to insert the "
                        {selectedBlock?.name}" block
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelInsertion}
                        className="h-8"
                    >
                        <IconX size={14} className="mr-1" /> Cancel
                    </Button>
                </div>
            ) : selectedInsertionElement && selectedBlock ? (
                <BlockConfigurationPanel
                    block={selectedBlock}
                    config={blockConfig}
                    onConfigChange={handleConfigChange}
                    onInsert={handleInsertBlock}
                    onCancel={handleCancelInsertion}
                    insertPosition={selectedInsertionPosition}
                />
            ) : (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium">Add Blocks</h2>
                        <div className="relative w-64">
                            <IconSearch
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                size={16}
                            />
                            <Input
                                placeholder="Search blocks..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="pl-8 !bg-[var(--feno-surface-0)] !border-none !shadow-[var(--feno-minimal-shadow)]"
                            />
                        </div>
                    </div>

                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="mb-2 !bg-[var(--feno-surface-2)] border border-[var(--feno-border-2)]">
                            {[
                                { label: "All Blocks", value: "all" },
                                { label: "Marketing", value: "marketing" },
                                {
                                    label: "Communication",
                                    value: "communication",
                                },
                            ].map((tab) => (
                                <TabsTrigger
                                    className=""
                                    key={tab.value}
                                    value={tab.value}
                                >
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent
                            value="all"
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2"
                        >
                            {blocks.map((block) => (
                                <BlockCard
                                    key={block.id}
                                    block={block}
                                    onSelect={handleBlockSelect}
                                />
                            ))}
                        </TabsContent>

                        <TabsContent
                            value="marketing"
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2"
                        >
                            {blocks
                                .filter((block) =>
                                    block.tags.includes("marketing"),
                                )
                                .map((block) => (
                                    <BlockCard
                                        key={block.id}
                                        block={block}
                                        onSelect={handleBlockSelect}
                                    />
                                ))}
                        </TabsContent>

                        <TabsContent
                            value="communication"
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                        >
                            {blocks
                                .filter((block) =>
                                    block.tags.includes("communication"),
                                )
                                .map((block) => (
                                    <BlockCard
                                        key={block.id}
                                        block={block}
                                        onSelect={handleBlockSelect}
                                    />
                                ))}
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
};

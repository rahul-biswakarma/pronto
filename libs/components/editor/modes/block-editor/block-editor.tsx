import { Button } from "@/libs/ui/button";
import { Input } from "@/libs/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/libs/ui/tabs";
import {
    IconAlertCircle,
    IconBlockquote,
    IconBrandMailgun,
    IconMessageCircle,
    IconPlus,
    IconQuote,
    IconSearch,
    IconX,
} from "@tabler/icons-react";
import { useCallback, useState } from "react";
import { useEditor } from "../../context/editor.context";
import { getAllBlocks, searchBlocks } from "./block-registry";
import type { BlockInfo } from "./block-registry";
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

    // Map the icon string to an actual icon component
    const getIconComponent = (iconName: string) => {
        const icons: Record<string, React.ReactNode> = {
            mail: <IconBrandMailgun size={20} />,
            "message-circle": <IconMessageCircle size={20} />,
            quote: <IconQuote size={20} />,
            default: <IconBlockquote size={20} />,
        };

        return icons[iconName] || icons.default;
    };

    return (
        <div className="p-4 w-full max-w-[80vw] mx-auto">
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
                                className="pl-8"
                            />
                        </div>
                    </div>

                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="all">All Blocks</TabsTrigger>
                            <TabsTrigger value="marketing">
                                Marketing
                            </TabsTrigger>
                            <TabsTrigger value="communication">
                                Communication
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="all"
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                        >
                            {blocks.map((block) => (
                                <div
                                    key={block.id}
                                    className="border rounded-lg p-4 hover:border-[var(--feno-primary)] hover:shadow-sm transition-all cursor-pointer"
                                    onClick={() => handleBlockSelect(block)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-[var(--feno-surface-2)] p-2 rounded-md">
                                                {getIconComponent(block.icon)}
                                            </div>
                                            <h3 className="font-medium">
                                                {block.name}
                                            </h3>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8"
                                        >
                                            <IconPlus size={16} />
                                        </Button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {block.description}
                                    </p>
                                </div>
                            ))}
                        </TabsContent>

                        <TabsContent
                            value="marketing"
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                        >
                            {blocks
                                .filter((block) =>
                                    block.tags.includes("marketing"),
                                )
                                .map((block) => (
                                    <div
                                        key={block.id}
                                        className="border rounded-lg p-4 hover:border-[var(--feno-primary)] hover:shadow-sm transition-all cursor-pointer"
                                        onClick={() => handleBlockSelect(block)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-[var(--feno-surface-2)] p-2 rounded-md">
                                                    {getIconComponent(
                                                        block.icon,
                                                    )}
                                                </div>
                                                <h3 className="font-medium">
                                                    {block.name}
                                                </h3>
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8"
                                            >
                                                <IconPlus size={16} />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {block.description}
                                        </p>
                                    </div>
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
                                    <div
                                        key={block.id}
                                        className="border rounded-lg p-4 hover:border-[var(--feno-primary)] hover:shadow-sm transition-all cursor-pointer"
                                        onClick={() => handleBlockSelect(block)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-[var(--feno-surface-2)] p-2 rounded-md">
                                                    {getIconComponent(
                                                        block.icon,
                                                    )}
                                                </div>
                                                <h3 className="font-medium">
                                                    {block.name}
                                                </h3>
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8"
                                            >
                                                <IconPlus size={16} />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {block.description}
                                        </p>
                                    </div>
                                ))}
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
};

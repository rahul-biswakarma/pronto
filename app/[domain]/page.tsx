"use client";
import { Canvas } from "@/libs/components/canvas/canvas";
import { CanvasProvider } from "@/libs/contexts/canvas-context";
import { RouteProvider } from "@/libs/contexts/route-context";
import { Button } from "@/libs/ui/button";
import { Card } from "@/libs/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/libs/ui/tabs";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DomainPage({ params }: { params: { domain: string } }) {
    const { domain } = params;
    const searchParams = useSearchParams();
    const variantId = searchParams.get("variant");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [websites, setWebsites] = useState<
        Array<{ id: string; html: string; complete: boolean }>
    >([]);

    useEffect(() => {
        // Initial setup
        setIsLoading(true);
        setError(null);
    }, [domain]);

    return (
        <RouteProvider domain={domain} currentRoute="/">
            <CanvasProvider>
                <div className="flex flex-col w-full min-h-screen bg-background">
                    <header className="border-b border-border p-4 flex justify-between items-center">
                        <h1 className="text-xl font-semibold">
                            Website Editor: {domain}
                        </h1>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                Save
                            </Button>
                            <Button size="sm">Publish</Button>
                        </div>
                    </header>

                    <main className="flex-1 p-4">
                        <Tabs defaultValue="canvas" className="w-full">
                            <TabsList className="mb-4">
                                <TabsTrigger value="canvas">Canvas</TabsTrigger>
                                <TabsTrigger value="code">Code</TabsTrigger>
                                <TabsTrigger value="settings">
                                    Settings
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent
                                value="canvas"
                                className="w-full h-[calc(100vh-180px)]"
                            >
                                <Canvas
                                    websites={websites}
                                    isLoading={isLoading}
                                />
                            </TabsContent>

                            <TabsContent value="code">
                                <Card className="p-4">
                                    <h2 className="text-lg font-medium mb-2">
                                        HTML Editor
                                    </h2>
                                    {/* Code editor would go here */}
                                </Card>
                            </TabsContent>

                            <TabsContent value="settings">
                                <Card className="p-4">
                                    <h2 className="text-lg font-medium mb-2">
                                        Website Settings
                                    </h2>
                                    {/* Settings form would go here */}
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </main>
                </div>
            </CanvasProvider>
        </RouteProvider>
    );
}

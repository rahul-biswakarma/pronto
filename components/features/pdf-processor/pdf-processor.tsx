"use client";

import { Flex } from "@radix-ui/themes";
import { FileUploader } from "./file-uploader";

export function PDFProcessor() {
    return (
        <Flex
            height="100%"
            justify="center"
            align="center"
            direction="column"
            gap="4"
            p="4"
        >
            <FileUploader />
        </Flex>
    );
}

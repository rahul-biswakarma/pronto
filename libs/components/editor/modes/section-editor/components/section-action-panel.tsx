import { Button } from "@/libs/ui/button";
import { IconDeviceFloppy } from "@tabler/icons-react";

interface SectionActionPanelProps {
    hasChanges: boolean;
    onSave: () => void;
}

/**
 * Action panel for section editor with save and reset buttons
 */
export const SectionActionPanel: React.FC<SectionActionPanelProps> = ({
    hasChanges,
    onSave,
}) => {
    if (!hasChanges) {
        return null;
    }

    return (
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 pt-4">
            <Button
                variant="default"
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={onSave}
            >
                <IconDeviceFloppy className="mr-1 size-4" />
                Save Changes
            </Button>
        </div>
    );
};

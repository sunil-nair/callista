import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ArrowUp, ArrowDown, ChevronsUp, ChevronsDown, Copy, Trash2 } from "lucide-react";

interface ElementContextMenuProps {
  children: React.ReactNode;
  onBringToFront: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onSendToBack: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const ElementContextMenu = ({
  children,
  onBringToFront,
  onBringForward,
  onSendBackward,
  onSendToBack,
  onDuplicate,
  onDelete,
}: ElementContextMenuProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-card z-50">
        <ContextMenuItem onClick={onBringToFront} className="cursor-pointer">
          <ChevronsUp className="h-4 w-4 mr-2" />
          Bring to Front
        </ContextMenuItem>
        <ContextMenuItem onClick={onBringForward} className="cursor-pointer">
          <ArrowUp className="h-4 w-4 mr-2" />
          Bring Forward
        </ContextMenuItem>
        <ContextMenuItem onClick={onSendBackward} className="cursor-pointer">
          <ArrowDown className="h-4 w-4 mr-2" />
          Send Backward
        </ContextMenuItem>
        <ContextMenuItem onClick={onSendToBack} className="cursor-pointer">
          <ChevronsDown className="h-4 w-4 mr-2" />
          Send to Back
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={onDuplicate} className="cursor-pointer">
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={onDelete} className="cursor-pointer text-destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

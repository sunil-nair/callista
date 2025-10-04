import { Rnd } from "react-rnd";
import { TemplateElement } from "@/types/template";
import { ElementContextMenu } from "../ElementContextMenu";
import { TextElement } from "./TextElement";
import { ImageElement } from "./ImageElement";
import { ShapeElement } from "./ShapeElement";
import { ButtonElement } from "./ButtonElement";

interface RenderableElementProps {
  element: TemplateElement;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onUpdate: (id: string, updates: Partial<TemplateElement>) => void;
  onStopEditing: () => void;
  onBringToFront: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onSendToBack: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export const RenderableElement = ({
  element,
  isSelected,
  isEditing,
  onSelect,
  onDoubleClick,
  onUpdate,
  onStopEditing,
  onBringToFront,
  onBringForward,
  onSendBackward,
  onSendToBack,
  onDuplicate,
  onDelete,
}: RenderableElementProps) => {
  return (
    <ElementContextMenu
      onBringToFront={onBringToFront}
      onBringForward={onBringForward}
      onSendBackward={onSendBackward}
      onSendToBack={onSendToBack}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
    >
      <Rnd
        position={element.position}
        size={element.size}
        onDragStop={(e, d) => {
          if (!isEditing) {
            onUpdate(element.id, {
              position: { x: d.x, y: d.y },
            });
          }
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          if (!isEditing) {
            onUpdate(element.id, {
              size: {
                width: parseInt(ref.style.width),
                height: parseInt(ref.style.height),
              },
              position,
            });
          }
        }}
        bounds="parent"
        style={{ zIndex: element.zIndex }}
        className={`${!isEditing ? 'cursor-move' : 'cursor-text'} ${isSelected ? 'ring-2 ring-primary' : ''}`}
        onClick={onSelect}
        disableDragging={isEditing}
        enableResizing={!isEditing}
      >
        <div 
          className="w-full h-full"
          onDoubleClick={onDoubleClick}
        >
          {element.type === 'text' && (
            <TextElement
              element={element}
              isEditing={isEditing}
              onUpdate={(content) => onUpdate(element.id, { content } as any)}
              onBlur={onStopEditing}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  onStopEditing();
                }
              }}
            />
          )}
          
          {element.type === 'image' && <ImageElement element={element} />}
          {element.type === 'shape' && <ShapeElement element={element} />}
          {element.type === 'button' && <ButtonElement element={element} />}
        </div>
      </Rnd>
    </ElementContextMenu>
  );
};

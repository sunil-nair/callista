import { TextElement as TextElementType } from "@/types/template";
import { PlaceholderText } from "../PlaceholderText";

interface TextElementProps {
  element: TextElementType;
  isEditing: boolean;
  onUpdate: (content: string) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export const TextElement = ({ element, isEditing, onUpdate, onBlur, onKeyDown }: TextElementProps) => {
  const style = {
    fontSize: element.style.fontSize,
    fontWeight: element.style.fontWeight,
    color: element.style.color,
    textAlign: element.style.textAlign,
    fontFamily: element.style.fontFamily || 'Inter, sans-serif',
    width: '100%',
    height: '100%',
  };

  if (isEditing) {
    return (
      <textarea
        autoFocus
        value={element.content}
        onChange={(e) => onUpdate(e.target.value)}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        style={{
          ...style,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          resize: 'none',
          overflow: 'hidden',
        }}
      />
    );
  }

  return (
    <PlaceholderText
      content={element.content}
      style={{
        ...style,
        overflow: 'hidden',
      }}
    />
  );
};

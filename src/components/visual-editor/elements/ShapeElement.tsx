import { ShapeElement as ShapeElementType } from "@/types/template";

interface ShapeElementProps {
  element: ShapeElementType;
}

export const ShapeElement = ({ element }: ShapeElementProps) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: element.style.backgroundColor,
        border: `${element.style.borderWidth}px solid ${element.style.borderColor}`,
        borderRadius: element.shapeType === 'circle' ? '50%' : element.style.borderRadius,
      }}
    />
  );
};

import { ImageElement as ImageElementType } from "@/types/template";

interface ImageElementProps {
  element: ImageElementType;
}

export const ImageElement = ({ element }: ImageElementProps) => {
  return (
    <img
      src={element.src}
      alt={element.alt}
      style={{
        width: '100%',
        height: '100%',
        objectFit: element.style.objectFit,
        objectPosition: element.style.objectPosition || 'center',
        borderRadius: element.style.borderRadius,
      }}
    />
  );
};

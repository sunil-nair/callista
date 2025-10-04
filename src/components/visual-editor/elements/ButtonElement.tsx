import { ButtonElement as ButtonElementType } from "@/types/template";

interface ButtonElementProps {
  element: ButtonElementType;
}

export const ButtonElement = ({ element }: ButtonElementProps) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: element.style.backgroundColor,
        color: element.style.color,
        fontSize: element.style.fontSize,
        borderRadius: element.style.borderRadius,
        padding: `${element.style.paddingY}px ${element.style.paddingX}px`,
      }}
    >
      {element.text}
    </div>
  );
};

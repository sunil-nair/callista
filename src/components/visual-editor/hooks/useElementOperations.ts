import { useState } from "react";
import { TemplateElement, EmailTemplate } from "@/types/template";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";

export const useElementOperations = (
  template: EmailTemplate,
  setTemplate: React.Dispatch<React.SetStateAction<EmailTemplate>>
) => {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const handleUpdateElement = (id: string, updates: Partial<TemplateElement>) => {
    setTemplate((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === id ? { ...el, ...updates } as TemplateElement : el
      ),
    }));
  };

  const handleDeleteElement = (id: string) => {
    setTemplate((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== id),
    }));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
    toast.success("Element deleted");
  };

  const handleBringForward = (id: string) => {
    setTemplate((prev) => {
      const element = prev.elements.find((el) => el.id === id);
      if (!element) return prev;

      const higherElements = prev.elements.filter((el) => el.zIndex > element.zIndex);
      if (higherElements.length === 0) return prev;

      const nextHigherElement = higherElements.reduce((lowest, el) =>
        el.zIndex < lowest.zIndex ? el : lowest
      );

      return {
        ...prev,
        elements: prev.elements.map((el) => {
          if (el.id === id) return { ...el, zIndex: nextHigherElement.zIndex } as TemplateElement;
          if (el.id === nextHigherElement.id) return { ...el, zIndex: element.zIndex } as TemplateElement;
          return el;
        }),
      };
    });
  };

  const handleSendBackward = (id: string) => {
    setTemplate((prev) => {
      const element = prev.elements.find((el) => el.id === id);
      if (!element) return prev;

      const lowerElements = prev.elements.filter((el) => el.zIndex < element.zIndex);
      if (lowerElements.length === 0) return prev;

      const nextLowerElement = lowerElements.reduce((highest, el) =>
        el.zIndex > highest.zIndex ? el : highest
      );

      return {
        ...prev,
        elements: prev.elements.map((el) => {
          if (el.id === id) return { ...el, zIndex: nextLowerElement.zIndex } as TemplateElement;
          if (el.id === nextLowerElement.id) return { ...el, zIndex: element.zIndex } as TemplateElement;
          return el;
        }),
      };
    });
  };

  const handleBringToFront = (id: string) => {
    setTemplate((prev) => {
      const maxZIndex = Math.max(...prev.elements.map((el) => el.zIndex), 0);
      return {
        ...prev,
        elements: prev.elements.map((el) =>
          el.id === id ? { ...el, zIndex: maxZIndex + 1 } as TemplateElement : el
        ),
      };
    });
  };

  const handleSendToBack = (id: string) => {
    setTemplate((prev) => {
      return {
        ...prev,
        elements: prev.elements.map((el) => {
          if (el.id === id) return { ...el, zIndex: 0 } as TemplateElement;
          if (el.id !== id && el.zIndex > 0) return { ...el, zIndex: el.zIndex + 1 } as TemplateElement;
          return el;
        }),
      };
    });
  };

  const handleDuplicateElement = (id: string) => {
    setTemplate((prev) => {
      const element = prev.elements.find((el) => el.id === id);
      if (!element) return prev;

      const newElement = {
        ...element,
        id: uuidv4(),
        position: {
          x: element.position.x + 20,
          y: element.position.y + 20,
        },
        zIndex: Math.max(...prev.elements.map((el) => el.zIndex), 0) + 1,
      } as TemplateElement;

      return {
        ...prev,
        elements: [...prev.elements, newElement],
      };
    });
    toast.success("Element duplicated");
  };

  return {
    selectedElementId,
    setSelectedElementId,
    editingTextId,
    setEditingTextId,
    handleUpdateElement,
    handleDeleteElement,
    handleBringForward,
    handleSendBackward,
    handleBringToFront,
    handleSendToBack,
    handleDuplicateElement,
  };
};

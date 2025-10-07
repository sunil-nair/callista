import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Code } from "lucide-react";
import { toast } from "sonner";
import { HTMLParser } from "@/utils/htmlParser";
import { HTMLGenerator } from "@/utils/htmlGenerator";
import { EmailTemplate } from "@/types/template";

interface EditHTMLDialogProps {
  template: EmailTemplate;
  onUpdate: (template: EmailTemplate) => void;
}

export const EditHTMLDialog = ({ template, onUpdate }: EditHTMLDialogProps) => {
  const [open, setOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  const handleOpen = () => {
    // Generate HTML from current template
    const html = HTMLGenerator.generateHTML(template, false);
    setHtmlContent(html);
    setOpen(true);
  };

  const handleSave = () => {
    if (!htmlContent.trim()) {
      toast.error("HTML content cannot be empty");
      return;
    }

    try {
      // Parse the HTML back into elements
      const elements = HTMLParser.parseHTML(htmlContent);
      
      if (elements.length === 0) {
        toast.error("No valid elements found in HTML");
        return;
      }

      // Update the template with new elements
      onUpdate({
        ...template,
        elements,
      });

      toast.success("HTML updated successfully");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to parse HTML");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={handleOpen}>
          <Code className="h-4 w-4 mr-2" />
          Edit HTML
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit HTML</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <Textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            placeholder="Edit your HTML here..."
            className="w-full h-full font-mono text-sm resize-none"
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

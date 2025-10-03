import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FileCode } from "lucide-react";
import { toast } from "sonner";

interface ImportHTMLDialogProps {
  onImport: (html: string) => void;
}

export const ImportHTMLDialog = ({ onImport }: ImportHTMLDialogProps) => {
  const [open, setOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  const handleImport = () => {
    if (!htmlContent.trim()) {
      toast.error("Please paste some HTML content");
      return;
    }

    try {
      onImport(htmlContent);
      setOpen(false);
      setHtmlContent("");
      toast.success("HTML imported successfully!");
    } catch (error) {
      toast.error("Failed to parse HTML. Please check your content.");
      console.error("HTML import error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <FileCode className="h-4 w-4 mr-2" />
          Import HTML
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import HTML Template</DialogTitle>
          <DialogDescription>
            Paste your HTML code below. The designer will convert it into editable visual elements.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="<div>Your HTML here...</div>"
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport}>
              Import & Convert
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    name: string;
    html: string;
  } | null;
}

export const PreviewDialog = ({ open, onOpenChange, template }: PreviewDialogProps) => {
  if (!template) return null;

  const copyHtml = () => {
    navigator.clipboard.writeText(template.html);
    toast.success("HTML copied to clipboard!");
  };

  const downloadHtml = () => {
    const blob = new Blob([template.html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.name.replace(/\s+/g, "-").toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("HTML downloaded!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{template.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="preview" className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyHtml}>
                <Copy className="h-4 w-4 mr-1" />
                Copy HTML
              </Button>
              <Button size="sm" variant="outline" onClick={downloadHtml}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>

          <TabsContent value="preview" className="border rounded-lg p-4 bg-background max-h-[50vh] overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: template.html }} />
          </TabsContent>

          <TabsContent value="html" className="border rounded-lg p-4 bg-muted max-h-[50vh] overflow-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap break-all">
              {template.html}
            </pre>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

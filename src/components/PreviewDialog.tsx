import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, Check } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { HTMLGenerator } from "@/utils/htmlGenerator";

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: {
    name: string;
    html: string;
    json_template: any;
  } | null;
}

export const PreviewDialog = ({ open, onOpenChange, template }: PreviewDialogProps) => {
  const [copied, setCopied] = useState(false);
  const [useTableLayout, setUseTableLayout] = useState(false);

  if (!template) return null;

  const displayHTML = useTableLayout && template.json_template
    ? HTMLGenerator.generateHTML(template.json_template, true)
    : template.html;

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(displayHTML);
      setCopied(true);
      toast.success("HTML copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy HTML");
    }
  };

  const downloadHtml = () => {
    const blob = new Blob([displayHTML], { type: "text/html" });
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
            <div className="flex items-center gap-4">
              <TabsList>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="html">HTML</TabsTrigger>
              </TabsList>
              <div className="flex items-center space-x-2">
                <Switch
                  id="layout-mode"
                  checked={useTableLayout}
                  onCheckedChange={setUseTableLayout}
                />
                <Label htmlFor="layout-mode" className="text-sm">
                  Table Layout (Email-friendly)
                </Label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyHtml}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy HTML
                  </>
                )}
              </Button>
              <Button size="sm" variant="outline" onClick={downloadHtml}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>

          <TabsContent value="preview" className="border rounded-lg p-4 bg-background max-h-[50vh] overflow-auto">
            <div dangerouslySetInnerHTML={{ __html: displayHTML }} />
          </TabsContent>

          <TabsContent value="html" className="border rounded-lg p-4 bg-muted max-h-[50vh] overflow-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap break-all">
              {displayHTML}
            </pre>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

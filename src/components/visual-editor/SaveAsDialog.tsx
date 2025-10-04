import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SaveAsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  currentShortcode: string;
  onSave: (name: string, shortcode: string) => void;
}

export const SaveAsDialog = ({
  open,
  onOpenChange,
  currentName,
  currentShortcode,
  onSave,
}: SaveAsDialogProps) => {
  const [name, setName] = useState(`${currentName} (Copy)`);
  const [shortcode, setShortcode] = useState(`${currentShortcode}-copy`);

  const handleSave = () => {
    if (name.trim() && shortcode.trim()) {
      onSave(name.trim(), shortcode.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Template As</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="save-as-name">Template Name</Label>
            <Input
              id="save-as-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter template name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="save-as-shortcode">API Shortcode</Label>
            <Input
              id="save-as-shortcode"
              value={shortcode}
              onChange={(e) => setShortcode(e.target.value)}
              placeholder="Enter API shortcode"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save as New Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

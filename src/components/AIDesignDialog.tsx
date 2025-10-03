import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EmailTemplate } from "@/types/template";

interface AIDesignDialogProps {
  canvasSize: { width: number; height: number };
  onDesignGenerated: (template: EmailTemplate) => void;
}

export const AIDesignDialog = ({ canvasSize, onDesignGenerated }: AIDesignDialogProps) => {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please describe the design you want to create",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('design-with-ai', {
        body: { prompt, canvasSize }
      });

      if (error) throw error;

      if (data && data.elements) {
        onDesignGenerated({
          elements: data.elements,
          canvasSize
        });
        
        toast({
          title: "Design generated!",
          description: "Your AI-generated design has been loaded",
        });
        
        setOpen(false);
        setPrompt("");
      }
    } catch (error) {
      console.error('Error generating design:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate design. Check your LLM configuration.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="h-4 w-4 mr-2" />
          Design with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>AI Design Generator</DialogTitle>
          <DialogDescription>
            Describe the email template you want to create. The AI will generate a design using available components.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Design Prompt</label>
            <Textarea
              placeholder="e.g., Create a welcome email with a hero image, heading, body text, and a CTA button"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            Canvas: {canvasSize.width}×{canvasSize.height}px ({canvasSize.width <= 375 ? 'Mobile' : canvasSize.width <= 768 ? 'Tablet' : 'Desktop'})
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isGenerating}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Design
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

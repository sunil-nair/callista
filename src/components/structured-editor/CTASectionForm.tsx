import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CTASection } from "@/types/structuredTemplate";

interface CTASectionFormProps {
  cta: CTASection;
  onChange: (cta: CTASection) => void;
}

export const CTASectionForm = ({ cta, onChange }: CTASectionFormProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Call to Action</h3>
      
      <div className="space-y-2">
        <Label htmlFor="buttonText">Button Text</Label>
        <Input
          id="buttonText"
          value={cta.buttonText}
          onChange={(e) => onChange({ ...cta, buttonText: e.target.value })}
          placeholder="Shop Now or {{cta_text}}"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="buttonUrl">Button URL</Label>
        <Input
          id="buttonUrl"
          value={cta.buttonUrl}
          onChange={(e) => onChange({ ...cta, buttonUrl: e.target.value })}
          placeholder="https://example.com/shop or {{cta_url}}"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="buttonColor">Button Color (Optional)</Label>
        <div className="flex gap-2">
          <Input
            id="buttonColor"
            type="color"
            value={cta.buttonColor || '#7C3AED'}
            onChange={(e) => onChange({ ...cta, buttonColor: e.target.value })}
            className="w-16 h-10 p-1 cursor-pointer"
          />
          <Input
            value={cta.buttonColor || '#7C3AED'}
            onChange={(e) => onChange({ ...cta, buttonColor: e.target.value })}
            placeholder="#7C3AED"
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ctaDescription">Description (Optional)</Label>
        <Textarea
          id="ctaDescription"
          value={cta.description || ''}
          onChange={(e) => onChange({ ...cta, description: e.target.value })}
          placeholder="Additional text above the button or {{cta_description}}"
          rows={2}
        />
      </div>
    </div>
  );
};

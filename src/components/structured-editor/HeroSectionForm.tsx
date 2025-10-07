import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HeroSection } from "@/types/structuredTemplate";

interface HeroSectionFormProps {
  hero: HeroSection;
  onChange: (hero: HeroSection) => void;
}

export const HeroSectionForm = ({ hero, onChange }: HeroSectionFormProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Hero Section</h3>
      
      <div className="space-y-2">
        <Label htmlFor="heroImage">Hero Image URL</Label>
        <Input
          id="heroImage"
          value={hero.imageUrl}
          onChange={(e) => onChange({ ...hero, imageUrl: e.target.value })}
          placeholder="https://example.com/hero.jpg or {{hero_image}}"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="headline">Headline</Label>
        <Input
          id="headline"
          value={hero.headline}
          onChange={(e) => onChange({ ...hero, headline: e.target.value })}
          placeholder="Your Main Headline or {{headline}}"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subheadline">Subheadline (Optional)</Label>
        <Textarea
          id="subheadline"
          value={hero.subheadline || ''}
          onChange={(e) => onChange({ ...hero, subheadline: e.target.value })}
          placeholder="Supporting text or {{subheadline}}"
          rows={3}
        />
      </div>
    </div>
  );
};

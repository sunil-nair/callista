import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BrandSettings } from "@/types/structuredTemplate";

interface BrandSettingsFormProps {
  brand: BrandSettings;
  onChange: (brand: BrandSettings) => void;
}

export const BrandSettingsForm = ({ brand, onChange }: BrandSettingsFormProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Brand Settings</h3>
      
      <div className="space-y-2">
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Input
          id="logoUrl"
          value={brand.logoUrl}
          onChange={(e) => onChange({ ...brand, logoUrl: e.target.value })}
          placeholder="https://example.com/logo.png"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessName">Business Name</Label>
        <Input
          id="businessName"
          value={brand.businessName}
          onChange={(e) => onChange({ ...brand, businessName: e.target.value })}
          placeholder="Your Business Name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="primaryColor">Primary Color</Label>
          <div className="flex gap-2">
            <Input
              id="primaryColor"
              type="color"
              value={brand.primaryColor}
              onChange={(e) => onChange({ ...brand, primaryColor: e.target.value })}
              className="w-16 h-10 p-1 cursor-pointer"
            />
            <Input
              value={brand.primaryColor}
              onChange={(e) => onChange({ ...brand, primaryColor: e.target.value })}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="secondaryColor">Secondary Color</Label>
          <div className="flex gap-2">
            <Input
              id="secondaryColor"
              type="color"
              value={brand.secondaryColor}
              onChange={(e) => onChange({ ...brand, secondaryColor: e.target.value })}
              className="w-16 h-10 p-1 cursor-pointer"
            />
            <Input
              value={brand.secondaryColor}
              onChange={(e) => onChange({ ...brand, secondaryColor: e.target.value })}
              placeholder="#666666"
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

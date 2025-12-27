import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FileInputProps {
  id: string;
  accept: string;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

export function FileInput({ id, accept, onChange, disabled }: FileInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    } else {
      onChange(null);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>PDF File</Label>
      <Input
        id={id}
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
}

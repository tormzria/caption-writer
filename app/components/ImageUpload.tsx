export function ImageUpload({
  onSelect,
}: {
  onSelect: (file: File, url: string) => void;
}) {
  return (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        onSelect(file, url);
      }}
    />
  );
}
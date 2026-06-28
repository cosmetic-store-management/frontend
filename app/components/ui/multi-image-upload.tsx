import React, { useState, useRef } from "react";
import { X, Loader2, Image as ImageIcon, Plus } from "lucide-react";
import { toast } from "@/lib/toast";

interface MultiImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  className?: string;
}

export function MultiImageUpload({
  value = [],
  onChange,
  className = "",
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newUrls: string[] = [];
    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) {
          toast.error("Vui lòng chọn file hình ảnh");
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error("Kích thước ảnh không được vượt quá 5MB");
          continue;
        }

        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newUrls.push(base64);
      }

      onChange([...value, ...newUrls]);
    } catch (error) {
      console.error("Upload error", error);
      toast.error("Tải ảnh lên thất bại");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (index: number) => {
    const newValues = [...value];
    newValues.splice(index, 1);
    onChange(newValues);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />

      {value.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {value.map((url, index) => (
            <div
              key={index}
              className="relative group rounded-sm border border-border overflow-hidden bg-surface-soft flex items-center justify-center aspect-square"
            >
              <img
                src={url}
                alt={`Uploaded ${index}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-1.5 bg-danger text-white rounded-sm hover:bg-danger transition-colors "
                  title="Xóa ảnh"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <div
            onClick={triggerUpload}
            className="group rounded-sm border-2 border-dashed border-border hover:border-brand bg-surface-soft hover:bg-brand/5 transition-all flex flex-col items-center justify-center cursor-pointer aspect-square"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-brand" />
            ) : (
              <Plus className="w-6 h-6 text-ink-muted group-hover:text-brand transition-colors" />
            )}
          </div>
        </div>
      )}

      {value.length === 0 && (
        <div
          onClick={triggerUpload}
          className="group rounded-sm border-2 border-dashed border-border hover:border-brand bg-surface-soft hover:bg-brand/5 transition-all flex flex-col items-center justify-center cursor-pointer h-32"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-brand mb-2" />
              <span className="text-xs font-medium">Đang tải lên...</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-8 h-8 mb-2 text-ink-muted group-hover:text-brand transition-colors" />
              <span className="text-xs font-medium text-ink-muted group-hover:text-brand transition-colors">
                Bấm để tải nhiều ảnh lên
              </span>
              <span className="text-[10px] text-ink-muted/70 mt-1">
                PNG, JPG up to 5MB
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

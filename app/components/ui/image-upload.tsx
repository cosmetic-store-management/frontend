import React, { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "@/lib/toast";
import { apiClient } from "@/lib/client";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  compact?: boolean; // chỉ hiện icon, ẩn text — dùng cho khối nhỏ
}

export function ImageUpload({ value, onChange, className = "", compact = false }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        setIsUploading(true);
        // Gọi API upload thực tế → lưu file lên server, trả về URL
        const result = await apiClient.post<{ url: string }>("/upload", { base64 });
        onChange(result.url);
      } catch (err) {
        console.error("Upload error", err);
        toast.error("Tải ảnh lên thất bại");
      } finally {
        setIsUploading(false);
        // Reset input để có thể chọn cùng file lại
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerUpload = () => fileInputRef.current?.click();

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {value ? (
        <div className="relative group rounded-md border border-border overflow-hidden bg-surface-soft flex items-center justify-center aspect-square">
          <img src={value} alt="Uploaded" className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={triggerUpload}
              className="p-1.5 bg-surface text-ink rounded-md hover:bg-surface-muted transition-colors"
              title="Thay đổi ảnh"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={removeImage}
              className="p-1.5 bg-danger text-white rounded-md hover:bg-danger transition-colors"
              title="Xóa ảnh"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={triggerUpload}
          className="group rounded-md border-2 border-dashed border-border hover:border-brand bg-surface-soft hover:bg-brand/5 transition-all flex flex-col items-center justify-center cursor-pointer aspect-square"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-brand" />
              {!compact && <span className="text-xs font-medium mt-1 text-ink-muted">Đang tải lên...</span>}
            </>
          ) : (
            <>
              <ImageIcon className={`text-ink-muted group-hover:text-brand transition-colors ${compact ? "w-5 h-5" : "w-8 h-8 mb-2"}`} />
              {compact ? (
                <span className="text-[9px] text-ink-muted group-hover:text-brand transition-colors mt-1 leading-tight text-center">Tải lên</span>
              ) : (
                <>
                  <span className="text-xs font-medium text-ink-muted group-hover:text-brand transition-colors">Bấm để tải ảnh lên</span>
                  <span className="text-[10px] text-ink-muted/70 mt-1">PNG, JPG · tối đa 5MB</span>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

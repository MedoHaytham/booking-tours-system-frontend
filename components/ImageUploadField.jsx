import Image from "next/image";
import { useRef } from "react";
import { ImagePlus } from "lucide-react";


export default function ImageUploadField({ label, id, accept, multiple, preview, onFile, hint }) {
  const inputRef = useRef(null);

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-grey-500 mb-1.5">
        {label}
        {hint && <span className="ml-1 font-normal normal-case text-grey-400">{hint}</span>}
      </label>
      <div
        onClick={() => inputRef.current?.click()}
        className="relative w-full min-h-22.5 border-2 border-dashed border-grey-200 rounded-xl bg-grey-50 hover:bg-grey-100 hover:border-primary/50 transition-colors cursor-pointer flex items-center justify-center gap-3 overflow-hidden"
      >
        {preview?.length ? (
          <div className="flex flex-wrap gap-2 p-3 justify-center">
            {preview.map((src, i) => (
              <div key={i} className="relative w-20 h-14 rounded-lg overflow-hidden border border-grey-200 shrink-0">
                <Image src={src} alt={`preview-${i}`} fill sizes="80px" className="object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-grey-400 py-3">
            <ImagePlus size={24} />
            <span className="text-xs font-medium">Click to upload</span>
          </div>
        )}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept || 'image/*'}
          multiple={!!multiple}
          className="hidden"
          onChange={onFile}
        />
      </div>
    </div>
  );
}
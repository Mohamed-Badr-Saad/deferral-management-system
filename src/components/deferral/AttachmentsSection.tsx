// src/components/deferral/AttachmentsSection.tsx
"use client";

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, X, FileText, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { formatFileSize } from '@/lib/utils';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '@/lib/constants';

interface AttachmentsSectionProps {
  attachments: File[];
  setAttachments: (files: File[]) => void;
}

export function AttachmentsSection({ attachments, setAttachments }: AttachmentsSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
    const validFiles: File[] = [];
    for (const file of files) {
      // Check file type
      if (!Object.values(ALLOWED_FILE_TYPES).includes(file.type as any)) {
        toast.error(`${file.name}: File type not allowed. Only PDF and images are accepted.`);
        continue;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setAttachments([...attachments, ...validFiles]);
      toast.success(`${validFiles.length} file(s) added successfully`);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const updated = attachments.filter((_, i) => i !== index);
    setAttachments(updated);
    toast.success('File removed');
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <ImageIcon className="h-8 w-8 text-blue-500" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Attachments</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Upload supporting documents (PDF, JPG, PNG). Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
        </p>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop files here, or click to browse
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Files
          </Button>
        </CardContent>
      </Card>

      {/* File List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Selected Files ({attachments.length})</h4>
          <div className="space-y-2">
            {attachments.map((file, index) => (
              <Card key={index}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    {getFileIcon(file)}
                    <div>
                      <p className="font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>Accepted formats:</strong> PDF, JPG, PNG
          <br />
          <strong>Maximum size:</strong> {formatFileSize(MAX_FILE_SIZE)} per file
          <br />
          <strong>Recommendation:</strong> Include supporting documentation such as risk assessments, 
          technical reports, or photos to support your deferral request.
        </p>
      </div>
    </div>
  );
}

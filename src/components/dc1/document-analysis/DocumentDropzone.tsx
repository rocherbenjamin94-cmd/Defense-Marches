import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import type { FileRejection } from 'react-dropzone';

interface DocumentDropzoneProps {
  onFileAccepted: (file: File) => void;
  isDisabled?: boolean;
}

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/tiff': ['.tiff', '.tif'],
};

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function DocumentDropzone({ onFileAccepted, isDisabled }: DocumentDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejections: FileRejection[]) => {
      if (rejections.length > 0) {
        const rejection = rejections[0];
        const errorCode = rejection.errors[0]?.code;

        if (errorCode === 'file-too-large') {
          alert('Le fichier est trop volumineux. Maximum: 10 Mo');
        } else if (errorCode === 'file-invalid-type') {
          alert('Type de fichier non supporté. Formats acceptés: PDF, DOCX, PNG, JPG, TIFF');
        }
        return;
      }
      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0]);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
    disabled: isDisabled,
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: `2px dashed ${
          isDragReject
            ? 'var(--color-error)'
            : isDragActive
              ? 'var(--color-primary)'
              : 'var(--border)'
        }`,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-xl)',
        textAlign: 'center',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        background: isDragActive ? 'var(--bg-muted)' : 'transparent',
        transition: 'all var(--transition-fast)',
      }}
    >
      <input {...getInputProps()} />
      <div style={{ fontSize: 48, marginBottom: 'var(--space-md)' }}>
        {isDragReject ? '❌' : isDragActive ? '📥' : '📄'}
      </div>
      <p style={{ fontWeight: 500, marginBottom: 'var(--space-sm)' }}>
        {isDragReject
          ? 'Type de fichier non supporté'
          : isDragActive
            ? 'Déposez le fichier ici...'
            : 'Glissez-déposez un document RC'}
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
        ou cliquez pour sélectionner un fichier
      </p>
      <p
        style={{
          color: 'var(--text-light)',
          fontSize: 12,
          marginTop: 'var(--space-sm)',
        }}
      >
        Formats acceptés: PDF, DOCX, PNG, JPG, TIFF (max 10 Mo)
      </p>
    </div>
  );
}

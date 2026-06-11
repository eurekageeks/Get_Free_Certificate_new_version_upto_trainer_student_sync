import type { Certificate } from './types';

export async function generateCertificateImage(certificate: Certificate): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    canvas.width = 1200;
    canvas.height = 850;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#0D9488';
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

    // Title
    ctx.textAlign = 'center';
    ctx.font = 'bold 48px Georgia';
    ctx.fillStyle = '#003B5C';
    ctx.fillText('CERTIFICATE OF COMPLETION', canvas.width / 2, 180);

    // Name
    ctx.font = 'bold 52px Georgia';
    ctx.fillStyle = '#B8860B';
    ctx.fillText(certificate.user_name, canvas.width / 2, 330);

    // Course
    ctx.font = '28px Georgia';
    ctx.fillStyle = '#333';
    ctx.fillText('has completed', canvas.width / 2, 400);

    ctx.font = 'bold 40px Georgia';
    ctx.fillStyle = '#0D5461';
    ctx.fillText(certificate.course_name, canvas.width / 2, 480);

    // Footer
    ctx.font = '16px Arial';
    ctx.fillStyle = '#555';

    ctx.fillText(
      `Certificate ID: ${certificate.certificate_number}`,
      canvas.width / 2,
      650
    );

    ctx.fillText(
      `Date: ${new Date(certificate.issued_at).toLocaleDateString()}`,
      canvas.width / 2,
      680
    );

    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to generate certificate image'));
        return;
      }
      resolve(blob);
    }, 'image/png', 1);
  });
}

export function downloadCertificateImage(certificate: Certificate, blob: Blob) {
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `certificate-${certificate.certificate_number}.png`;

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

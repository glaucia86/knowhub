import path from 'node:path';
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  type NestInterceptor,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import type { Observable } from 'rxjs';

const FILE_CONFIG = {
  pdf: {
    mimeTypes: ['application/pdf'],
    extensions: ['.pdf'],
    maxBytes: 50 * 1024 * 1024,
    label: 'PDFs',
  },
  text: {
    mimeTypes: ['text/plain', 'text/markdown', 'application/octet-stream'],
    extensions: ['.txt', '.md'],
    maxBytes: 10 * 1024 * 1024,
    label: 'text files',
  },
} as const;

type FileType = keyof typeof FILE_CONFIG;

@Injectable()
export class FileValidationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ file?: Express.Multer.File }>();
    const file = request.file;

    if (!file) {
      throw new BadRequestException('The “file” field is required');
    }

    const extension = path.extname(file.originalname).toLowerCase();
    const isPdf = (FILE_CONFIG.pdf.extensions as readonly string[]).includes(extension);
    const isText = (FILE_CONFIG.text.extensions as readonly string[]).includes(extension);

    if (!isPdf && !isText) {
      throw new UnsupportedMediaTypeException(
        `Extension "${extension}" not supported. Accepted: .pdf, .txt, .md`,
      );
    }

    const fileType: FileType = isPdf ? 'pdf' : 'text';
    const config = FILE_CONFIG[fileType];
    const validMime =
      (config.mimeTypes as readonly string[]).includes(file.mimetype) ||
      file.mimetype === 'application/octet-stream';

    if (!validMime) {
      throw new UnsupportedMediaTypeException(
        `MIME type "${file.mimetype}" invalid for extension "${extension}"`,
      );
    }

    if (file.size > config.maxBytes) {
      const maxMb = config.maxBytes / (1024 * 1024);
      throw new PayloadTooLargeException(
        `File exceeds the limit of ${maxMb} MB for ${config.label}`,
      );
    }

    return next.handle();
  }
}

import { NextResponse } from 'next/server';
import multer from 'multer';
import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';

const upload = multer({ dest: 'public/uploads/' });

export const POST = async (req: Request): Promise<Response> => {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const filePath = `public/uploads/${file.name}`;
    fs.writeFileSync(filePath, Buffer.from(await file.arrayBuffer()));

    const fileType = path.extname(file.name).toLowerCase();

    try {
        let data: Record<string, string>[] = [];

        if (fileType === '.csv') {
            data = await new Promise((resolve, reject) => {
                const results: Record<string, string>[] = [];
                fs.createReadStream(filePath)
                    .pipe(parse({ columns: true }))
                    .on('data', (row) => results.push(row))
                    .on('end', () => resolve(results))
                    .on('error', (err) => reject(err));
            });
        } else {
            return NextResponse.json({ error: 'Unsupported file format' }, { status: 400 });
        }

        fs.unlinkSync(filePath); // Hapus file sementara
        return NextResponse.json({ data });
    } catch (error) {
        return NextResponse.json({ error: 'Error processing file', details: error.message }, { status: 500 });
    }
};
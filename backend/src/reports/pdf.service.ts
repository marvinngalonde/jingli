import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfService {
    async generateReportPdf(report: any, res: Response) {
        return new Promise<void>((resolve, reject) => {
            try {
                // Initialize PDFDocument with bufferPages so we can loop back and add footers
                const doc = new PDFDocument({
                    margins: { top: 50, bottom: 30, left: 50, right: 50 },
                    size: 'A4',
                    bufferPages: true
                });

                // Set response headers to trigger download/view in browser
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${report.name.replace(/[^a-z0-9]/gi, '_')}.pdf"`);

                // Pipe the PDF output to the Express response
                doc.pipe(res);

                // --- Colors & Branding ---
                const primaryColor = '#1d4ed8'; // Deeper Blue
                const secondaryColor = '#f8fafc'; // Slate 50
                const borderColor = '#e2e8f0'; // Slate 200
                const textColor = '#0f172a'; // Slate 900
                const lightText = '#64748b'; // Slate 500

                // --- School Config Extraction ---
                const schoolName = report.school?.name || 'Jingli International School';
                let schoolEmail = 'contact@jingli.edu';
                let schoolPhone = '+1 (555) 123-4567';
                let schoolAddress = '123 Education Lane, Tech District';

                if (report.school?.config) {
                    try {
                        const config = typeof report.school.config === 'string' ? JSON.parse(report.school.config) : report.school.config;
                        if (config.contactEmail) schoolEmail = config.contactEmail;
                        if (config.phone) schoolPhone = config.phone;
                    } catch (e) {
                        // ignore parse errors
                    }
                }

                // --- 1. Header Area ---
                // Add Jingli Logo if exists
                const logoPath = path.resolve('c:\\arvip\\jingli\\frontend\\src\\assets\\logos\\logo-trans.png');
                if (fs.existsSync(logoPath)) {
                    doc.image(logoPath, 50, 45, { width: 140 });
                } else {
                    doc.fillColor(primaryColor).fontSize(24).font('Helvetica-Bold').text('Jingli Reports', 50, 50);
                }

                // Header Details (Right Aligned)
                doc.fillColor(textColor).fontSize(14).font('Helvetica-Bold').text(schoolName, 200, 50, { align: 'right' });
                doc.fillColor(lightText).fontSize(10).font('Helvetica').text(`${schoolAddress}\n${schoolEmail}  |  ${schoolPhone}`, 200, 68, { align: 'right' });

                // Divider Line
                doc.moveTo(50, 110).lineTo(doc.page.width - 50, 110).strokeColor(primaryColor).lineWidth(2).stroke();

                let currentY = 140;

                // --- 2. Report Title & Metadata ---
                doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('OFFICIAL SYSTEM DOCUMENT', 50, currentY);
                currentY += 15;
                doc.fillColor(textColor).fontSize(26).font('Helvetica-Bold').text(report.name, 50, currentY);
                currentY += 40;

                // Metadata Grid Boxes
                doc.rect(50, currentY, 230, 60).fillAndStroke(secondaryColor, borderColor);
                doc.rect(doc.page.width - 280, currentY, 230, 60).fillAndStroke(secondaryColor, borderColor);

                // Box 1
                doc.fillColor(lightText).fontSize(9).font('Helvetica-Bold').text('PREPARED BY', 65, currentY + 15);
                doc.fillColor(textColor).fontSize(11).font('Helvetica').text(report.generatedBy, 65, currentY + 30);

                // Box 2
                doc.fillColor(lightText).fontSize(9).font('Helvetica-Bold').text('DATE GENERATED', doc.page.width - 265, currentY + 15);
                doc.fillColor(textColor).fontSize(11).font('Helvetica').text(new Date(report.createdAt).toLocaleString(), doc.page.width - 265, currentY + 30);

                currentY += 90;

                // --- 3. Report Summary & Aggregated Data ---
                if (report.parameters && report.parameters.summary) {
                    const summary = report.parameters.summary;

                    doc.fontSize(16).font('Helvetica-Bold').fillColor(primaryColor).text('Executive Summary', 50, currentY);
                    currentY += 25;

                    doc.fontSize(10).font('Helvetica').fillColor(lightText)
                        .text(`Total Records Processed: ${summary.totalRecords || 0}   |   Period: ${summary.period || 'All Time'}`, 50, currentY);
                    currentY += 30;

                    // Sections (The dynamic data points)
                    if (summary.sections && Array.isArray(summary.sections)) {
                        let isLeftColumn = true;
                        let sectionStartY = currentY;

                        summary.sections.forEach((section: any, index: number) => {
                            if (index > 0 && index % 2 === 0) {
                                currentY += 75;
                                sectionStartY = currentY;
                            }

                            // Page break check
                            if (currentY > doc.page.height - 120) {
                                doc.addPage();
                                currentY = 50;
                                sectionStartY = 50;
                                isLeftColumn = true;
                            }

                            const xPos = isLeftColumn ? 50 : 310;

                            // Minimalist Data Point Box
                            doc.rect(xPos, currentY, 230, 60).fill(secondaryColor);
                            doc.moveTo(xPos, currentY).lineTo(xPos, currentY + 60).strokeColor(primaryColor).lineWidth(4).stroke();

                            // Data Point Title
                            doc.fillColor(lightText).fontSize(9).font('Helvetica-Bold').text(section.title.toUpperCase(), xPos + 15, currentY + 12);

                            // Data Point Value
                            doc.fillColor(textColor).fontSize(13).font('Helvetica').text(section.details || section.value, xPos + 15, currentY + 30, { width: 200, lineBreak: false, ellipsis: true });

                            isLeftColumn = !isLeftColumn;
                        });
                        currentY += 85;
                    }
                } else {
                    doc.fillColor(lightText).fontSize(11).font('Helvetica-Oblique').text('No detailed aggregated data available for this report type.', 50, currentY);
                }

                // --- 4. Footer Area ---
                // Page numbers & Footer Text
                const range = doc.bufferedPageRange();
                for (let i = range.start; i < range.count; i++) {
                    doc.switchToPage(i);
                    doc.moveTo(50, doc.page.height - 60).lineTo(doc.page.width - 50, doc.page.height - 60).strokeColor(borderColor).lineWidth(1).stroke();
                    doc.fillColor(lightText).fontSize(8).font('Helvetica').text(
                        `Jingli Reporting Engine v2  |  Generated securely from verified system records`,
                        50,
                        doc.page.height - 45
                    );
                    doc.text(
                        `Page ${i + 1} of ${range.count}`,
                        0,
                        doc.page.height - 45,
                        { align: 'right', width: doc.page.width - 50 }
                    );
                }

                // Finalize the PDF
                doc.end();

                // Resolve when the stream finishes
                res.on('finish', () => resolve());
                res.on('error', (err) => reject(err));

            } catch (error) {
                reject(error);
            }
        });
    }

    async generateTablePdf(
        title: string,
        columns: { header: string; key: string }[],
        rows: Record<string, any>[],
        res: Response,
        schoolName: string = 'Jingli International School'
    ) {
        return new Promise<void>((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    margins: { top: 50, bottom: 30, left: 40, right: 40 },
                    size: 'A4',
                    bufferPages: true,
                    layout: 'landscape'
                });

                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/[^a-z0-9]/gi, '_')}.pdf"`);
                doc.pipe(res);

                const primaryColor = '#1d4ed8';
                const borderColor = '#e2e8f0';
                const textColor = '#0f172a';
                const lightText = '#64748b';
                const headerBg = '#1e3a8a';
                const altRowBg = '#f8fafc';
                const pageWidth = doc.page.width;
                const marginL = 40;
                const marginR = 40;
                const contentWidth = pageWidth - marginL - marginR;

                // ---- Header ----
                const logoPath = path.resolve('c:\\arvip\\jingli\\frontend\\src\\assets\\logos\\logo-trans.png');
                if (fs.existsSync(logoPath)) {
                    doc.image(logoPath, marginL, 30, { width: 110 });
                } else {
                    doc.fillColor(primaryColor).fontSize(18).font('Helvetica-Bold').text('Jingli', marginL, 35);
                }
                doc.fillColor(textColor).fontSize(12).font('Helvetica-Bold')
                    .text(schoolName, marginL + 120, 35, { align: 'right', width: contentWidth - 120 });
                doc.fillColor(lightText).fontSize(9).font('Helvetica')
                    .text(`Data Export  |  Generated: ${new Date().toLocaleString()}`, marginL + 120, 50, { align: 'right', width: contentWidth - 120 });

                doc.moveTo(marginL, 78).lineTo(pageWidth - marginR, 78).strokeColor(primaryColor).lineWidth(2).stroke();

                // ---- Title ----
                doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(18).text(title, marginL, 88);
                doc.fillColor(lightText).font('Helvetica').fontSize(9)
                    .text(`Total Records: ${rows.length}`, marginL, 110);

                let currentY = 128;

                // ---- Table ----
                const colCount = columns.length;
                const colWidth = contentWidth / colCount;
                const rowHeight = 22;
                const headerHeight = 26;

                // Header row
                doc.rect(marginL, currentY, contentWidth, headerHeight).fill(headerBg);
                columns.forEach((col, i) => {
                    doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold')
                        .text(col.header.toUpperCase(), marginL + i * colWidth + 5, currentY + 8, {
                            width: colWidth - 10,
                            lineBreak: false,
                            ellipsis: true
                        });
                });
                currentY += headerHeight;

                // Data rows
                rows.forEach((row, rowIndex) => {
                    // Page break check
                    if (currentY + rowHeight > doc.page.height - 70) {
                        doc.addPage({ layout: 'landscape' });
                        currentY = 40;
                        // Repeat header on new page
                        doc.rect(marginL, currentY, contentWidth, headerHeight).fill(headerBg);
                        columns.forEach((col, i) => {
                            doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold')
                                .text(col.header.toUpperCase(), marginL + i * colWidth + 5, currentY + 8, {
                                    width: colWidth - 10, lineBreak: false, ellipsis: true
                                });
                        });
                        currentY += headerHeight;
                    }

                    // Alternating row background
                    if (rowIndex % 2 === 0) {
                        doc.rect(marginL, currentY, contentWidth, rowHeight).fill(altRowBg);
                    }

                    // Row border
                    doc.rect(marginL, currentY, contentWidth, rowHeight).stroke(borderColor);

                    columns.forEach((col, i) => {
                        const val = row[col.key] != null ? String(row[col.key]) : '—';
                        doc.fillColor(textColor).fontSize(8).font('Helvetica')
                            .text(val, marginL + i * colWidth + 5, currentY + 7, {
                                width: colWidth - 10,
                                lineBreak: false,
                                ellipsis: true
                            });
                    });

                    currentY += rowHeight;
                });

                // ---- Footer ----
                const range = doc.bufferedPageRange();
                for (let i = range.start; i < range.count; i++) {
                    doc.switchToPage(i);
                    doc.moveTo(marginL, doc.page.height - 40)
                        .lineTo(pageWidth - marginR, doc.page.height - 40)
                        .strokeColor(borderColor).lineWidth(1).stroke();
                    doc.fillColor(lightText).fontSize(8).font('Helvetica')
                        .text('Jingli Reporting Engine v2  |  Confidential — For internal use only', marginL, doc.page.height - 28);
                    doc.text(`Page ${i + 1} of ${range.count}`, 0, doc.page.height - 28, {
                        align: 'right', width: pageWidth - marginR
                    });
                }

                doc.end();
                res.on('finish', () => resolve());
                res.on('error', (err) => reject(err));
            } catch (error) {
                reject(error);
            }
        });
    }
}

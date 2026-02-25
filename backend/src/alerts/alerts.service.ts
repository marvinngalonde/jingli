import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AlertsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly config: ConfigService,
    ) { }

    // ═══════ Templates ═══════
    async createTemplate(dto: any, schoolId: string) {
        return this.prisma.alertTemplate.create({ data: { schoolId, ...dto } });
    }

    async findAllTemplates(schoolId: string) {
        return this.prisma.alertTemplate.findMany({
            where: { schoolId },
            include: { _count: { select: { logs: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateTemplate(id: string, dto: any, schoolId: string) {
        return this.prisma.alertTemplate.update({ where: { id, schoolId }, data: dto });
    }

    async removeTemplate(id: string, schoolId: string) {
        return this.prisma.alertTemplate.delete({ where: { id, schoolId } });
    }

    // ═══════ Send Alert ═══════
    async sendAlert(dto: { recipientPhone: string; recipientName?: string; message: string; channel: string; templateId?: string }, schoolId: string) {
        // Create log entry
        const log = await this.prisma.alertLog.create({
            data: {
                schoolId,
                templateId: dto.templateId,
                recipientPhone: dto.recipientPhone,
                recipientName: dto.recipientName,
                message: dto.message,
                channel: dto.channel as any,
                status: 'QUEUED',
            },
        });

        // Dispatch based on channel
        try {
            if (dto.channel === 'SMS') {
                await this.sendSms(dto.recipientPhone, dto.message);
            } else if (dto.channel === 'WHATSAPP') {
                await this.sendWhatsApp(dto.recipientPhone, dto.message);
            }
            // Mark as sent
            await this.prisma.alertLog.update({ where: { id: log.id }, data: { status: 'SENT', sentAt: new Date() } });
        } catch (error: any) {
            await this.prisma.alertLog.update({ where: { id: log.id }, data: { status: 'FAILED', errorMessage: error.message } });
        }

        return log;
    }

    private async sendSms(phone: string, message: string) {
        const apiKey = this.config.get('SMS_API_KEY');
        const apiUrl = this.config.get('SMS_API_URL') || 'https://api.africastalking.com/version1/messaging';
        // Placeholder — will integrate with selected SMS provider
        console.log(`[SMS] Sending to ${phone}: ${message} (API: ${apiUrl}, Key: ${apiKey?.substring(0, 5)}...)`);
        if (!apiKey) throw new Error('SMS_API_KEY not configured');
    }

    private async sendWhatsApp(phone: string, message: string) {
        const apiKey = this.config.get('WHATSAPP_API_KEY');
        // Placeholder — will integrate with WhatsApp Business API
        console.log(`[WhatsApp] Sending to ${phone}: ${message}`);
        if (!apiKey) throw new Error('WHATSAPP_API_KEY not configured');
    }

    // ═══════ Logs ═══════
    async findAllLogs(schoolId: string, channel?: string, status?: string) {
        const where: any = { schoolId };
        if (channel) where.channel = channel;
        if (status) where.status = status;

        return this.prisma.alertLog.findMany({
            where,
            include: { template: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }

    async getStats(schoolId: string) {
        const [total, sent, failed, pending] = await Promise.all([
            this.prisma.alertLog.count({ where: { schoolId } }),
            this.prisma.alertLog.count({ where: { schoolId, status: 'SENT' } }),
            this.prisma.alertLog.count({ where: { schoolId, status: 'FAILED' } }),
            this.prisma.alertLog.count({ where: { schoolId, status: { in: ['PENDING', 'QUEUED'] } } }),
        ]);
        return { total, sent, failed, pending };
    }
}

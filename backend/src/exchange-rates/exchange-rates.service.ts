import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExchangeRateDto } from './dto/exchange-rate.dto';

@Injectable()
export class ExchangeRatesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateExchangeRateDto, schoolId: string) {
        return this.prisma.exchangeRate.create({
            data: {
                schoolId,
                fromCurrency: dto.fromCurrency,
                toCurrency: dto.toCurrency,
                rate: dto.rate,
                effectiveDate: new Date(dto.effectiveDate),
                source: dto.source || 'Manual',
            },
        });
    }

    async findAll(schoolId: string) {
        return this.prisma.exchangeRate.findMany({
            where: { schoolId },
            orderBy: { effectiveDate: 'desc' },
        });
    }

    async getLatest(schoolId: string, from: string, to: string) {
        return this.prisma.exchangeRate.findFirst({
            where: {
                schoolId,
                fromCurrency: from,
                toCurrency: to,
                effectiveDate: { lte: new Date() },
            },
            orderBy: { effectiveDate: 'desc' },
        });
    }

    async convert(schoolId: string, amount: number, from: string, to: string) {
        if (from === to) return { converted: amount, rate: 1 };
        const rate = await this.getLatest(schoolId, from, to);
        if (!rate) throw new Error(`No exchange rate found for ${from} -> ${to}`);
        return {
            converted: Number((amount * Number(rate.rate)).toFixed(2)),
            rate: Number(rate.rate),
            effectiveDate: rate.effectiveDate,
        };
    }

    async remove(id: string, schoolId: string) {
        return this.prisma.exchangeRate.delete({ where: { id, schoolId } });
    }
}

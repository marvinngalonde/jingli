import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
    @ApiProperty({ example: 'sender-uuid' })
    @IsString()
    @IsNotEmpty()
    senderId: string;

    @ApiProperty({ example: 'receiver-uuid' })
    @IsString()
    @IsNotEmpty()
    receiverId: string;

    @ApiProperty({ example: 'Hello, I have a question about...' })
    @IsString()
    @IsNotEmpty()
    content: string;
}

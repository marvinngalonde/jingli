import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) { }

    @Post()
    @ApiOperation({ summary: 'Send a message' })
    create(@Body() createDto: CreateMessageDto) {
        return this.messagesService.create(createDto);
    }

    @Get('conversation')
    @ApiOperation({ summary: 'Get conversation between two users' })
    @ApiQuery({ name: 'user1' })
    @ApiQuery({ name: 'user2' })
    findConversation(@Query('user1') user1: string, @Query('user2') user2: string) {
        return this.messagesService.findConversation(user1, user2);
    }

    @Get('inbox')
    @ApiOperation({ summary: 'Get recent messages for a user' })
    @ApiQuery({ name: 'userId' })
    getUserMessages(@Query('userId') userId: string) {
        return this.messagesService.getUserMessages(userId);
    }

    @Get('conversations')
    @ApiOperation({ summary: 'Get grouped conversations for a user' })
    @ApiQuery({ name: 'userId' })
    getConversations(@Query('userId') userId: string) {
        return this.messagesService.getConversations(userId);
    }
}

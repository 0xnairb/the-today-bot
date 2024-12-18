import { Body, Controller, Get, Logger, Param, Post, Request, Sse, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { EventDto, LoginDto } from './dto/chat.dto';
import { EventEntity } from './entities/chat.entity';
import { Observable } from 'rxjs';

@UseGuards(ThrottlerGuard)
@Controller()
export class ChatController {
  private readonly logger = new Logger(ChatController.name);
  constructor(private readonly chatService: ChatService) {}

  @Post('/login')
  async login(@Body() req: LoginDto) {
    const access_token = await this.chatService.signin(req);
    return { access_token };
  }

  @Get('/events')
  async getAllEvents(@Request() req): Promise<EventEntity[]> {
    return await this.chatService.getEvents()
  }

  @UseGuards(AuthGuard)
  @Post('/event')
  async createEvent(@Request() req, @Body() body: EventDto) {
    body.tid = req['user']['tid'];
    const res = await this.chatService.createEvent(body);
    return res;
  }

  @UseGuards(AuthGuard)
  @Get('/event')
  async getEvents(@Request() req): Promise<EventEntity[]> {
    return await this.chatService.getEvent(req['user']['tid'])
  }

  @UseGuards(AuthGuard)
  @Post('/event/:id/accept')
  async accept(@Request() req, @Param('id') id: string) {
    await this.chatService.accept(id, req['user']['tid']);
  }

  @Sse('/notification')
  registerNotification(): Observable<MessageEvent<string>> {
    return this.chatService.notification();
  }
}

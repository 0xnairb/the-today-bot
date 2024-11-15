import { Body, Controller, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { EventDto, LoginDto } from './dto/chat.dto';

@UseGuards(ThrottlerGuard)
@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('/login')
  async login(@Body() req: LoginDto) {
    const access_token = await this.chatService.signin(req);
    return { access_token };
  }

  @UseGuards(AuthGuard)
  @Post('/event')
  async createEvent(@Request() req, @Body() body: EventDto) {
    body.tid = req['user']['tid'];
    const res = await this.chatService.createEvent(body);
    return res;
  }

  @UseGuards(AuthGuard)
  @Post('/event/:id/accept')
  async accept(@Request() req, @Param('id') id: string) {
    await this.chatService.accept(id, req['user']['tid']);
  }
}

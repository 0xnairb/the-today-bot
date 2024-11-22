import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AuthEntity,
  EventEntity,
  RoomEntity,
  UserEntity,
} from './entities/chat.entity';
import { Like, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { EventDto, LoginDto, ParticipantDto } from './dto/chat.dto';
import TelegramBot from 'node-telegram-bot-api';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly bot = new TelegramBot(process.env.BOT_SECRET);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(AuthEntity)
    private readonly authRepo: Repository<AuthEntity>,
    @InjectRepository(EventEntity)
    private readonly eventRepo: Repository<EventEntity>,
    @InjectRepository(RoomEntity)
    private readonly roomRepo: Repository<RoomEntity>,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.bot.onText(/\/start/, (msg) => this.onStart(msg));

    this.bot.onText(/\/schedule (.+)/, (msg, match) => {
      const resp = match[1]; // the captured "description"

      this.onSchedule(msg, resp);
    });

    this.bot.onText(/\/accept (.+)/, (msg, match) => {
      const resp = match[1]; // the captured "description"

      this.onAccept(msg, resp);
    });
  }

  async signin(req: LoginDto): Promise<string> {
    let user = await this.userRepo.findOneBy({
      tid: req.tid,
    });

    if (!user) {
      user = new UserEntity();
      user.tid = req.tid;
      const auth = new AuthEntity();
      auth.accessToken = req.oauth_token;
      auth.user = user;
      user.auth = auth;
    } else {
      user.auth.accessToken = req.oauth_token;
    }

    user = await this.userRepo.save(user);
    return this.jwtService.signAsync({ id: user.id, tid: user.tid });
  }

  async createEvent(req: EventDto) {
    // creator
    const creator = await this.userRepo.findOneByOrFail({
      tid: req.tid,
    });
    // extract participants from the description
    const participants: ParticipantDto[] = await Promise.all(
      req.description
        .match(/@\w+/g)
        .map((item) => item)
        .map(async (item) => {
          const participant = new ParticipantDto();
          participant.tid = item.slice(1);
          participant.status = await this.userRepo.existsBy({ tid: item });
          return participant;
        }),
    );

    if (!participants.length) {
      throw new Error('Cannot find participant');
    }

    const ee = new EventEntity();
    ee.description = req.description;
    ee.creator = creator;
    ee.participants = participants.map((item) => item.tid);

    const event = await this.eventRepo.save(ee);

    return {
      event,
      participants,
    };
  }

  async accept(id: string, tid: string) {
    const event = await this.eventRepo.findOneBy({ id });
    const participant = await this.userRepo.findOneByOrFail({ tid });

    console.log(event, participant)

    if (!event.accepted) {
      event.accepted = [tid];
    } else {
      if (event.accepted.indexOf(tid) === -1) {
        event.accepted.push(tid);
      }
    }

    return this.eventRepo.save(event);
  }

  async getEvent(tid: string): Promise<EventEntity[]> {
    return this.eventRepo.find({
      where: {
        participants: Like(`%${tid}%`),
      }
    })
  }

  /*********************************** Bot Functions ***********************************/
  async onStart(msg: TelegramBot.Message) {
    const roomId = msg.chat.id;
    const teleId = msg.chat.username;

    // signin
    await this.signin({
      tid: teleId,
      oauth_token: ''
    });

    // check room
    let room = await this.roomRepo.findOneBy({
      tid: teleId,
    });

    if (!room) {
      room = await this.roomRepo.save({
        tid: teleId,
        rid: roomId,
      });
    } else {
      if (room.rid !== roomId) {
        room.rid = roomId;
        room = await this.roomRepo.save(room);
      }
    }

    this.bot.sendMessage(roomId, 'halo');
  }

  async onSchedule(msg: TelegramBot.Message, text: string) {
    try {
      const roomId = msg.chat.id;
      const teleId = msg.chat.username;

      let room = await this.roomRepo.findOneBy({
        tid: `${teleId}`,
      });

      const event = await this.createEvent({
        description: text.trim(),
        tid: '',
        oauth_token: ''
      });

      this.bot.sendMessage(
        roomId,
        `
Event ID: ${event.event.id}
Event detail: ${event.event.description}
Participants:
${event.participants
  .map((item) => {
    if (item.status)
      return `- ${item.tid}`;
    else
      return `- ${item.tid}\nAsk him/her to join: https://t.me/the_today_bot`
  })
  .join('\n')}  
`,
      );
    } catch (e) {
      this.bot.sendMessage(msg.chat.id, e.message);
    }
  }

  async onAccept(msg: TelegramBot.Message, text: string) {
    try {
      const roomId = msg.chat.id;
      const teleId = msg.chat.username;

      const event = await this.eventRepo.findOneByOrFail({
        id: text.trim(),
      });
      await this.accept(event.id, `${teleId}`);

      // broadcast message to all participants (except this user)
      for (const tid of event.participants) {
        const room = await this.roomRepo.findOneBy({
          tid
        });

        if (room) {
          this.bot.sendMessage(room.rid, `${teleId} accepted the event ${event.id}`)
        }
      }
    } catch (e) {
      this.bot.sendMessage(msg.chat.id, e.message);
    }
  }
}

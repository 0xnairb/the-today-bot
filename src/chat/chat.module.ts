import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity, EventEntity, RoomEntity, UserEntity } from './entities/chat.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, AuthEntity, EventEntity, RoomEntity])
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}

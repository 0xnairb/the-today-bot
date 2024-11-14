import { UserEntity } from "../entities/chat.entity";

export class LoginDto {
  tid: string;
}

export class EventDto extends LoginDto {
  description: string;
}

export class ParticipantDto extends UserEntity {
  status: boolean;
}
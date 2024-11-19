export class LoginDto {
  tid: string;
}

export class EventDto extends LoginDto {
  description: string;
}

export class ParticipantDto {
  tid: string;
  status: boolean;
}
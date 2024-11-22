export class LoginDto {
  tid: string;
  oauth_token: string;
}

export class EventDto extends LoginDto {
  description: string;
}

export class ParticipantDto {
  tid: string;
  status: boolean;
}
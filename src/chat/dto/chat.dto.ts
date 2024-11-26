export class LoginDto {
  tid: string;
  email: string;
  oauth_token: string;
}

export class EventDto extends LoginDto {
  description: string;
}

export class ParticipantDto {
  tid: string;
  status: boolean;
}

export class CalendarDto {
  start: CalendarTimeDto;
  end: CalendarTimeDto;
}

export class CalendarTimeDto {
  dateTime: string;
  timeZone: string;
}
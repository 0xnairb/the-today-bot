import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  email: string;
  @Column()
  tid: string;

  @OneToOne(() => AuthEntity, (auth) => auth.user)
  auth: Relation<AuthEntity>;
  @OneToMany(() => EventEntity, (event) => event.creator)
  events: EventEntity[];

  @ManyToMany(() => EventEntity, (event) => event.participants)
  schedules: EventEntity[];
}

@Entity()
export class AuthEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @OneToOne(() => UserEntity, (user) => user.auth)
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserEntity>;
  @Column({ name: 'access_token' })
  accessToken: string;
  @Column({ name: 'refresh_token' })
  refreshToken: string;
}

@Entity()
export class EventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  description: string;
  @ManyToOne(() => UserEntity, (user) => user.events)
  @JoinColumn({ name: 'creator_id' })
  creator: UserEntity;

  @Column('simple-array', { array: true })
  participants: string[];

  @Column('simple-array', { array: true, nullable: true})
  accepted: string[];
}

@Entity()
export class RoomEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  rid: number;
  @Column()
  tid: string;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
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

  @OneToOne(() => AuthEntity, (auth) => auth.user, { eager: true, cascade: true })
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
  @Column({ name: 'refresh_token', nullable: true })
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

  @CreateDateColumn()
  created_at: Date;

  @Column({ name: 'suggested_start_time', nullable: true })
  suggestedStartTime: Date;

  @Column({ name: 'suggested_end_time', nullable: true })
  suggestedEndTime: Date;
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
